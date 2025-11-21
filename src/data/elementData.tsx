
import React from "react";

export const elementCategories = {
  collars: [
    {
      id: "classic-collar",
      name: "Classic Collar",
      category: "collars",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M10,17 C20,5 40,5 50,17" />
        </svg>
      ),
    },
    {
      id: "round-collar",
      name: "Round Collar",
      category: "collars",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M10,15 C20,0 40,0 50,15" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: "v-collar",
      name: "V-Neck Collar",
      category: "collars",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M10,5 L30,25 L50,5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: "polo-collar",
      name: "Polo Collar",
      category: "collars",
      type: "component",
      preview: (
        <svg width="60" height="24" viewBox="0 0 60 24" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M10,17 C20,5 40,5 50,17" />
          <path d="M30,5 L30,18" strokeLinecap="round" />
          <circle cx="30" cy="10" r="2" fill="black" />
          <circle cx="30" cy="16" r="2" fill="black" />
        </svg>
      ),
    },
    {
      id: "turtle-collar",
      name: "Turtle Neck",
      category: "collars",
      type: "component",
      preview: (
        <svg width="60" height="30" viewBox="0 0 60 30" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M20,25 C20,15 40,15 40,25" strokeLinecap="round" />
          <path d="M20,25 L20,15" strokeLinecap="round" />
          <path d="M40,25 L40,15" strokeLinecap="round" />
        </svg>
      ),
    },
  ],
  pockets: [
    {
      id: "square-pocket",
      name: "Square Pocket",
      category: "pockets",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <rect x="5" y="5" width="30" height="30" />
        </svg>
      ),
    },
    {
      id: "rounded-pocket",
      name: "Rounded Pocket",
      category: "pockets",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <rect x="5" y="5" width="30" height="30" rx="5" />
        </svg>
      ),
    },
    {
      id: "angled-pocket",
      name: "Angled Pocket",
      category: "pockets",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <polygon points="5,5 35,5 30,35 10,35" />
        </svg>
      ),
    },
    {
      id: "curved-pocket",
      name: "Curved Pocket",
      category: "pockets",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,10 Q20,-5 35,10 L35,35 L5,35 Z" />
        </svg>
      ),
    },
    {
      id: "patched-pocket",
      name: "Patched Pocket",
      category: "pockets",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <rect x="5" y="5" width="30" height="30" />
          <line x1="5" y1="15" x2="35" y2="15" />
        </svg>
      ),
    },
  ],
  buttons: [
    {
      id: "round-button",
      name: "Round Button",
      category: "buttons",
      type: "component",
      preview: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="black" strokeWidth="1.5">
          <circle cx="10" cy="10" r="8" />
        </svg>
      ),
    },
    {
      id: "square-button",
      name: "Square Button",
      category: "buttons",
      type: "component",
      preview: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="black" strokeWidth="1.5">
          <rect x="2" y="2" width="16" height="16" />
        </svg>
      ),
    },
    {
      id: "diamond-button",
      name: "Diamond Button",
      category: "buttons",
      type: "component",
      preview: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="black" strokeWidth="1.5">
          <polygon points="10,2 18,10 10,18 2,10" />
        </svg>
      ),
    },
    {
      id: "toggle-button",
      name: "Toggle Button",
      category: "buttons",
      type: "component",
      preview: (
        <svg width="30" height="15" viewBox="0 0 30 15" fill="none" stroke="black" strokeWidth="1.5">
          <rect x="2" y="2" width="26" height="11" rx="5.5" />
          <circle cx="8" cy="7.5" r="4" fill="black" />
        </svg>
      ),
    },
    {
      id: "metal-button",
      name: "Metal Button",
      category: "buttons",
      type: "component",
      preview: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="black" strokeWidth="1.5">
          <circle cx="10" cy="10" r="8" />
          <circle cx="10" cy="10" r="5" />
          <circle cx="10" cy="10" r="2" />
        </svg>
      ),
    },
  ],
  zippers: [
    {
      id: "standard-zipper",
      name: "Standard Zipper",
      category: "zippers",
      type: "component",
      preview: (
        <svg width="10" height="60" viewBox="0 0 10 60" fill="none" stroke="black" strokeWidth="1.5">
          <line x1="5" y1="5" x2="5" y2="55" />
          <rect x="2" y="55" width="6" height="5" />
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1="1" y1={10 + i * 5} x2="4" y2={10 + i * 5} />
              <line x1="6" y1={10 + i * 5} x2="9" y2={10 + i * 5} />
            </React.Fragment>
          ))}
        </svg>
      ),
    },
    {
      id: "decorative-zipper",
      name: "Decorative Zipper",
      category: "zippers",
      type: "component",
      preview: (
        <svg width="10" height="60" viewBox="0 0 10 60" fill="none" stroke="black" strokeWidth="1.5">
          <line x1="5" y1="5" x2="5" y2="55" />
          <rect x="2" y="55" width="6" height="5" />
          <circle cx="5" cy="5" r="3" />
          {[...Array(5)].map((_, i) => (
            <React.Fragment key={i}>
              <rect x="1" y={15 + i * 10} width="3" height="3" />
              <rect x="6" y={15 + i * 10} width="3" height="3" />
            </React.Fragment>
          ))}
        </svg>
      ),
    },
    {
      id: "invisible-zipper",
      name: "Invisible Zipper",
      category: "zippers",
      type: "component",
      preview: (
        <svg width="10" height="60" viewBox="0 0 10 60" fill="none" stroke="black" strokeWidth="1">
          <line x1="5" y1="5" x2="5" y2="55" strokeDasharray="2,2" />
          <rect x="3" y="55" width="4" height="4" />
        </svg>
      ),
    },
    {
      id: "two-way-zipper",
      name: "Two-Way Zipper",
      category: "zippers",
      type: "component",
      preview: (
        <svg width="10" height="60" viewBox="0 0 10 60" fill="none" stroke="black" strokeWidth="1.5">
          <line x1="5" y1="5" x2="5" y2="55" />
          <rect x="2" y="5" width="6" height="3" />
          <rect x="2" y="55" width="6" height="3" />
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1="1" y1={10 + i * 5} x2="4" y2={10 + i * 5} />
              <line x1="6" y1={10 + i * 5} x2="9" y2={10 + i * 5} />
            </React.Fragment>
          ))}
        </svg>
      ),
    },
  ],
  hems: [
    {
      id: "straight-hem",
      name: "Straight Hem",
      category: "hems",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <line x1="5" y1="5" x2="55" y2="5" />
        </svg>
      ),
    },
    {
      id: "curved-hem",
      name: "Curved Hem",
      category: "hems",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,5 Q30,15 55,5" />
        </svg>
      ),
    },
    {
      id: "asymmetric-hem",
      name: "Asymmetric Hem",
      category: "hems",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,5 L30,15 L55,5" />
        </svg>
      ),
    },
    {
      id: "split-hem",
      name: "Split Hem",
      category: "hems",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,5 L25,5" />
          <path d="M35,5 L55,5" />
          <path d="M30,5 L30,15" />
        </svg>
      ),
    },
    {
      id: "scalloped-hem",
      name: "Scalloped Hem",
      category: "hems",
      type: "component",
      preview: (
        <svg width="60" height="20" viewBox="0 0 60 20" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,5 Q10,10 15,5 Q20,10 25,5 Q30,10 35,5 Q40,10 45,5 Q50,10 55,5" />
        </svg>
      ),
    },
  ],
  sleeves: [
    {
      id: "cap-sleeve",
      name: "Cap Sleeve",
      category: "sleeves",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,20 Q20,10 35,20" />
        </svg>
      ),
    },
    {
      id: "short-sleeve",
      name: "Short Sleeve",
      category: "sleeves",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,20 L15,5 L25,5 L35,20" />
          <line x1="15" y1="5" x2="25" y2="5" />
        </svg>
      ),
    },
    {
      id: "long-sleeve",
      name: "Long Sleeve",
      category: "sleeves",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,35 L15,5 L25,5 L35,35" />
          <line x1="15" y1="5" x2="25" y2="5" />
        </svg>
      ),
    },
    {
      id: "bell-sleeve",
      name: "Bell Sleeve",
      category: "sleeves",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,35 C10,20 15,5 20,5 C25,5 30,20 35,35" />
        </svg>
      ),
    },
    {
      id: "raglan-sleeve",
      name: "Raglan Sleeve",
      category: "sleeves",
      type: "component",
      preview: (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="black" strokeWidth="1.5">
          <path d="M5,35 L10,5 L30,5 L35,35" />
          <line x1="10" y1="5" x2="30" y2="5" />
          <path d="M10,5 L20,15 L30,5" strokeDasharray="2,2" />
        </svg>
      ),
    },
  ]
};
