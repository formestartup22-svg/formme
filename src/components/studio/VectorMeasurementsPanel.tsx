import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useVectorDrawing, AnchorPoint, VectorPath } from '@/hooks/useVectorDrawing';
import { MoveHorizontal, MoveVertical, RefreshCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface VectorMeasurementsPanelProps {
  vectorContext?: ReturnType<typeof useVectorDrawing>;
  className?: string;
}

const toDeg = (rad: number) => (rad * 180) / Math.PI;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const dist = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.hypot(b.x - a.x, b.y - a.y);
const angleDeg = (a: {x:number;y:number}, b: {x:number;y:number}) => {
  let d = toDeg(Math.atan2(b.y - a.y, b.x - a.x));
  if (d < 0) d += 360;
  return d;
};

export default function VectorMeasurementsPanel({ vectorContext, className = '' }: VectorMeasurementsPanelProps) {
  const fallback = useVectorDrawing();
  const ctx = vectorContext || fallback;
  const { vectorLayers, selectedAnchorIds, updateAnchorPoint, isDrawing, currentPath, finishPath } = ctx;

  // Resolve selected anchors and their path
  const selection = useMemo(() => {
    const all: { path: VectorPath; anchor: AnchorPoint; index: number }[] = [];
    for (const layer of vectorLayers) {
      for (const p of layer.paths) {
        p.points.forEach((a, i) => {
          if (selectedAnchorIds.includes(a.id)) all.push({ path: p, anchor: a, index: i });
        });
      }
    }
    return all;
  }, [vectorLayers, selectedAnchorIds]);

  const twoPointSegment = useMemo(() => {
    // Prefer any two anchors from the same path
    if (selection.length >= 2) {
      for (let i = 0; i < selection.length; i++) {
        for (let j = i + 1; j < selection.length; j++) {
          if (selection[i].path.id === selection[j].path.id) {
            return { A: selection[i], B: selection[j] } as const;
          }
        }
      }
    }
    // If only one anchor is selected, infer segment using its neighbor on the same path
    if (selection.length === 1) {
      const s = selection[0];
      const p = s.path;
      const idx = s.index;
      const neighborIdx = idx < p.points.length - 1 ? idx + 1 : idx > 0 ? idx - 1 : idx;
      if (neighborIdx !== idx) {
        const neighbor = { path: p, anchor: p.points[neighborIdx], index: neighborIdx } as const;
        return { A: s, B: neighbor } as const;
      }
    }
    // No editable segment available from selection
    return null;
  }, [selection]);

  const canEdit = useMemo(() => {
    if (twoPointSegment) return true;
    if (isDrawing && currentPath && currentPath.points.length >= 2) return true;
    return false;
  }, [twoPointSegment, isDrawing, currentPath]);

  const [len, setLen] = useState<number | ''>('');
  const [ang, setAng] = useState<number | ''>('');
  const [curv, setCurv] = useState<number>(0);

  useEffect(() => {
    if (twoPointSegment) {
      const { A, B } = twoPointSegment;
      setLen(Number(dist(A.anchor, B.anchor).toFixed(2)));
      setAng(Number(angleDeg(A.anchor, B.anchor).toFixed(2)));
    } else if (isDrawing && currentPath && currentPath.points.length >= 2) {
      const pts = currentPath.points;
      const A = pts[pts.length - 2];
      const B = pts[pts.length - 1];
      setLen(Number(dist(A, B).toFixed(2)));
      setAng(Number(angleDeg(A, B).toFixed(2)));
    } else {
      setLen('');
      setAng('');
    }
  }, [twoPointSegment, isDrawing, currentPath]);

  // Reset curvature when selection or drawing context changes
  useEffect(() => {
    setCurv(0);
  }, [twoPointSegment, isDrawing, currentPath]);

  const applyLen = (newLen: number) => {
    console.log('[Measurements] applyLen', {
      newLen,
      isDrawing,
      hasCurrentPath: !!currentPath,
      currentPathPoints: currentPath?.points.length,
      twoPointSegment: !!twoPointSegment,
    });
    // If drawing, directly update the last point of the in-progress path (avoid race with finishPath)
    if (isDrawing && currentPath && currentPath.points.length >= 2) {
      const pts = currentPath.points;
      const A = pts[pts.length - 2];
      const B = pts[pts.length - 1];
      const theta = toRad(typeof ang === 'number' ? ang : angleDeg(A, B));
      const nx = A.x + Math.cos(theta) * newLen;
      const ny = A.y + Math.sin(theta) * newLen;
      const bId = B.id;
      // Use hook method that edits currentPath directly
      // @ts-ignore - method is provided by vectorContext if passed from hook
      ctx.updateCurrentPathAnchor?.(bId, { x: nx, y: ny });
      setLen(Number(newLen.toFixed(2)));
      return;
    }
    if (!twoPointSegment) {
      console.log('[Measurements] No editable segment found – ignoring length change');
      return;
    }
    const { A, B } = twoPointSegment;
    const theta = toRad(typeof ang === 'number' ? ang : angleDeg(A.anchor, B.anchor));
    const nx = A.anchor.x + Math.cos(theta) * newLen;
    const ny = A.anchor.y + Math.sin(theta) * newLen;
    console.log('[Measurements] updating anchor on existing path', { pathId: A.path.id, anchorId: B.anchor.id, nx, ny, thetaDeg: typeof ang === 'number' ? ang : angleDeg(A.anchor, B.anchor) });
    updateAnchorPoint(A.path.id, B.anchor.id, { x: nx, y: ny });
    setLen(Number(newLen.toFixed(2)));
  };

  const applyAng = (newAng: number) => {
    // If drawing, edit the last point using current length without committing path yet
    if (isDrawing && currentPath && currentPath.points.length >= 2 && typeof len === 'number') {
      const pts = currentPath.points;
      const A = pts[pts.length - 2];
      const B = pts[pts.length - 1];
      const theta = toRad(newAng);
      const nx = A.x + Math.cos(theta) * len;
      const ny = A.y + Math.sin(theta) * len;
      const bId = B.id;
      // @ts-ignore
      ctx.updateCurrentPathAnchor?.(bId, { x: nx, y: ny });
      setAng(Number(newAng.toFixed(2)));
      return;
    }
    if (!twoPointSegment || typeof len !== 'number') return;
    const { A, B } = twoPointSegment;
    const theta = toRad(newAng);
    const nx = A.anchor.x + Math.cos(theta) * len;
    const ny = A.anchor.y + Math.sin(theta) * len;
    updateAnchorPoint(A.path.id, B.anchor.id, { x: nx, y: ny });
    setAng(Number(newAng.toFixed(2)));
  };

  const applyCurv = (newCurv: number) => {
    // Convert percentage to factor
    const c = Math.max(-100, Math.min(100, newCurv));
    const factor = c / 100; // -1..1

    const calcHandles = (A: {x:number;y:number}, B: {x:number;y:number}) => {
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      const L = Math.hypot(dx, dy);
      if (L < 1) return null;
      const ux = dx / L;
      const uy = dy / L;
      const nx = -uy; // left-hand normal
      const ny = ux;
      const d = L / 3; // handle distance along chord
      const off = factor * L * 0.25; // perpendicular offset
      const outAx = A.x + ux * d + nx * off;
      const outAy = A.y + uy * d + ny * off;
      const inBx  = B.x - ux * d + nx * off;
      const inBy  = B.y - uy * d + ny * off;
      return { outA: { x: outAx, y: outAy }, inB: { x: inBx, y: inBy } };
    };

    // In-progress path edit
    if (isDrawing && currentPath && currentPath.points.length >= 2) {
      const pts = currentPath.points;
      const A = pts[pts.length - 2];
      const B = pts[pts.length - 1];
      const handles = calcHandles(A, B);
      if (!handles) return;
      // @ts-ignore
      ctx.updateCurrentPathAnchor?.(A.id, { type: 'smooth', controlOut: { ...handles.outA, type: 'out' } });
      // @ts-ignore
      ctx.updateCurrentPathAnchor?.(B.id, { type: 'smooth', controlIn: { ...handles.inB, type: 'in' } });
      setCurv(c);
      return;
    }

    // Existing segment edit
    if (!twoPointSegment) return;
    const { A, B } = twoPointSegment;
    const handles = calcHandles(A.anchor, B.anchor);
    if (!handles) return;
    updateAnchorPoint(A.path.id, A.anchor.id, { type: 'smooth', controlOut: { ...handles.outA, type: 'out' } });
    updateAnchorPoint(A.path.id, B.anchor.id, { type: 'smooth', controlIn: { ...handles.inB, type: 'in' } });
    setCurv(c);
  };
  const nudge = (dx: number, dy: number) => {
    if (!twoPointSegment) return;
    if (isDrawing && currentPath && twoPointSegment.A.path.id === currentPath.id) return; // don't edit while drawing
    const { B, A } = twoPointSegment;
    updateAnchorPoint(A.path.id, B.anchor.id, { x: B.anchor.x + dx, y: B.anchor.y + dy });
  };

  const totalPathLen = useMemo(() => {
    if (!twoPointSegment) return null;
    const { A } = twoPointSegment;
    const p = A.path;
    let l = 0;
    for (let i = 1; i < p.points.length; i++) l += dist(p.points[i - 1], p.points[i]);
    return Number(l.toFixed(2));
  }, [twoPointSegment]);

  return (
    <Card className={`rounded-2xl border border-border shadow-sm ${className}`}>
      <CardContent className="p-4 space-y-4">
        <div className="text-sm font-medium text-foreground">Measurements</div>
        <div className="text-xs text-muted-foreground">Select two points to edit a segment. While drawing, values are read-only.</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Length (px)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={len}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setLen(v);
                  if (typeof v === 'number') applyLen(v);
                }}
                onBlur={() => typeof len === 'number' && applyLen(len)}
                className="h-8 text-xs"
                disabled={!canEdit}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Angle (°)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={ang}
                onChange={(e) => {
                  const v = e.target.value === '' ? '' : Number(e.target.value);
                  setAng(v);
                  if (typeof v === 'number') applyAng(v);
                }}
                onBlur={() => typeof ang === 'number' && applyAng(ang)}
                className="h-8 text-xs"
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div>
            <Label className="text-xs mb-1 block">Quick Length</Label>
            <Slider
              value={[typeof len === 'number' ? len : 0]}
              onValueChange={(v) => applyLen(v[0])}
              max={1000}
              min={0}
              step={1}
              disabled={!canEdit}
            />
          </div>

          <div>
            <Label className="text-xs">Curvature (%)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                value={curv}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setCurv(v);
                  applyCurv(v);
                }}
                onBlur={() => applyCurv(curv)}
                className="h-8 text-xs w-[100px]"
                min={-100}
                max={100}
                step={1}
                disabled={!canEdit}
              />
            </div>
            <Slider
              value={[curv]}
              onValueChange={(v) => applyCurv(v[0])}
              max={100}
              min={-100}
              step={1}
              disabled={!canEdit}
            />
          </div>
        </div>

        <Separator />

        <div>
          <Label className="text-xs mb-2 block">Nudge Selected Point (px)</Label>
          <div className="grid grid-cols-3 gap-2">
            <div />
            <Button variant="outline" size="sm" className="h-8" onClick={() => nudge(0, -1)} disabled={!canEdit}>
              <ArrowUp className="w-3 h-3" />
            </Button>
            <div />
            <Button variant="outline" size="sm" className="h-8" onClick={() => nudge(-1, 0)} disabled={!canEdit}>
              <ArrowLeft className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => nudge(0, 1)} disabled={!canEdit}>
              <ArrowDown className="w-3 h-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => nudge(1, 0)} disabled={!canEdit}>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {typeof totalPathLen === 'number' && (
          <div className="text-xs text-muted-foreground">Path total length: <span className="font-medium text-foreground">{totalPathLen} px</span></div>
        )}
      </CardContent>
    </Card>
  );
}
