
import { Canvas } from "@react-three/fiber";
import { useElementContext } from "@/context/ElementContext";
import TShirtModel from "./TShirtModel";

const ThreeDCanvas = () => {
  const { modelSettings } = useElementContext();

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <TShirtModel
          customColors={{
            body: modelSettings.colors.body
          }}
        />
      </Canvas>
    </div>
  );
};

export default ThreeDCanvas;
