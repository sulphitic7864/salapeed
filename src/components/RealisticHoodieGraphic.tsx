import React from 'react';
import { GarmentSide } from '../types';
import { COLOR_OPTIONS } from '../data/mockData';

interface RealisticHoodieGraphicProps {
  imageType: 'zipper' | 'pullover' | 'jacket' | 'kids';
  colorName: string;
  side: GarmentSide;
  className?: string;
  highlightTexture?: boolean;
}

export const RealisticHoodieGraphic: React.FC<RealisticHoodieGraphicProps> = ({
  imageType,
  colorName,
  side,
  className = '',
  highlightTexture = true,
}) => {
  const colorData = COLOR_OPTIONS[colorName] || COLOR_OPTIONS.Black;
  const hex = colorData.hex;
  const isWhite = colorName === 'White';
  const isBlack = colorName === 'Black';

  // Dynamic optical shading based on garment color
  const seamColor = isWhite ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.16)';
  const shadowFoldColor = isWhite ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.45)';
  const deepShadowColor = isWhite ? 'rgba(0, 0, 0, 0.22)' : 'rgba(0, 0, 0, 0.7)';
  const highlightColor = isWhite ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.14)';
  const drawstringCordColor = isWhite ? '#d1d5db' : '#f3f4f6';
  const agletColor = '#9ca3af';

  // Unique filter ID prefix to avoid SVG DOM collisions
  const uniqueId = `hoodie-${imageType}-${side}-${colorName.toLowerCase()}`;

  return (
    <svg
      className={`w-full h-full select-none pointer-events-none transition-colors duration-300 ${className}`}
      viewBox="0 0 500 580"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft 3D Drop Shadow for the entire garment silhouette */}
        <filter id={`${uniqueId}-drop-shadow`} x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000000" floodOpacity="0.65" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </filter>

        {/* Realistic Cotton Fleece Heather/Knit Texture Filter */}
        {highlightTexture && (
          <filter id={`${uniqueId}-fabric-noise`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.55"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.5
                      0 0 0 0 0.5
                      0 0 0 0 0.5
                      0 0 0 0.09 0"
              result="softNoise"
            />
            <feComposite operator="in" in2="SourceGraphic" result="textured" />
            <feBlend mode="overlay" in="textured" in2="SourceGraphic" />
          </filter>
        )}

        {/* Realistic Cylindrical Fabric Gradient for Torso */}
        <linearGradient id={`${uniqueId}-torso-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
          <stop offset="15%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity={isWhite ? 0.08 : 0.12} />
          <stop offset="75%" stopColor="#ffffff" stopOpacity="0.02" />
          <stop offset="90%" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.38" />
        </linearGradient>

        {/* Realistic Top-to-Bottom Lighting Gradient */}
        <linearGradient id={`${uniqueId}-vertical-light`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={isWhite ? 0.15 : 0.18} />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.0" />
          <stop offset="85%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>

        {/* Realistic Left Arm Cylinder Lighting */}
        <linearGradient id={`${uniqueId}-left-arm-grad`} x1="30%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>

        {/* Realistic Right Arm Cylinder Lighting */}
        <linearGradient id={`${uniqueId}-right-arm-grad`} x1="70%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>

        {/* Metallic Zipper Texture Pattern */}
        <pattern id={`${uniqueId}-zipper-teeth`} width="4" height="6" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="4" height="2.5" fill="#a1a1aa" />
          <rect x="0" y="2.5" width="4" height="3.5" fill="#3f3f46" />
        </pattern>

        {/* Ribbed Knit Pattern for Hem and Cuffs */}
        <pattern id={`${uniqueId}-ribbing`} width="6" height="40" patternUnits="userSpaceOnUse">
          <line x1="1" y1="0" x2="1" y2="40" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" />
          <line x1="3" y1="0" x2="3" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1="5" y1="0" x2="5" y2="40" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        </pattern>
      </defs>

      {/* ========================================================================= */}
      {/* 1. SLEEVE ANATOMICAL VIEW */}
      {/* ========================================================================= */}
      {side === 'sleeve' && (
        <g filter={`url(#${uniqueId}-drop-shadow)`}>
          {/* Main Sleeve Fabric Silhouette */}
          <path
            d="M 165 52 C 220 40 280 40 335 52 C 325 150 315 280 306 465 C 298 480 280 488 250 488 C 220 488 202 480 194 465 C 185 280 175 150 165 52 Z"
            fill={hex}
          />
          {/* Natural Arm Light Gradient */}
          <path
            d="M 165 52 C 220 40 280 40 335 52 C 325 150 315 280 306 465 C 298 480 280 488 250 488 C 220 488 202 480 194 465 C 185 280 175 150 165 52 Z"
            fill={`url(#${uniqueId}-torso-grad)`}
          />
          {/* Drop Shoulder Rounded Seam */}
          <path
            d="M 165 52 C 215 72 285 72 335 52"
            stroke={seamColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Double Stitching on Shoulder */}
          <path
            d="M 168 59 C 216 78 284 78 332 59"
            stroke={seamColor}
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Realistic Elbow Fold Creases */}
          <g opacity="0.45">
            <path
              d="M 180 245 C 205 255 240 252 265 248"
              stroke={shadowFoldColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 182 248 C 205 258 240 255 267 251"
              stroke={highlightColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M 235 270 C 260 275 295 268 318 260"
              stroke={shadowFoldColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Forearm Taper Shadow */}
          <path
            d="M 194 465 L 306 465 L 302 420 C 270 430 230 430 198 420 Z"
            fill={shadowFoldColor}
            opacity="0.3"
          />

          {/* Ribbed Wrist Cuff with 2x2 Texture */}
          <rect x="194" y="465" width="112" height="48" rx="6" fill={hex} />
          <rect x="194" y="465" width="112" height="48" rx="6" fill={`url(#${uniqueId}-ribbing)`} />
          <rect x="194" y="465" width="112" height="48" rx="6" fill="rgba(0,0,0,0.15)" />
          {/* Cuff attachment top seam */}
          <line x1="194" y1="465" x2="306" y2="465" stroke={seamColor} strokeWidth="2.5" />
          <line x1="194" y1="469" x2="306" y2="469" stroke={seamColor} strokeWidth="1" strokeDasharray="3 2" />
        </g>
      )}

      {/* ========================================================================= */}
      {/* 2. FRONT & BACK VIEWS */}
      {/* ========================================================================= */}
      {side !== 'sleeve' && (
        <g filter={`url(#${uniqueId}-drop-shadow)`}>
          {/* -------------------- SLEEVES BEHIND TORSO -------------------- */}
          {/* Left Sleeve (Viewer's Left) */}
          <g>
            <path
              d="M 142 124 L 46 276 C 36 290 42 302 56 307 L 98 318 L 152 208 Z"
              fill={hex}
            />
            <path
              d="M 142 124 L 46 276 C 36 290 42 302 56 307 L 98 318 L 152 208 Z"
              fill={`url(#${uniqueId}-left-arm-grad)`}
            />
            {/* Left Armpit Deep Shadow */}
            <path
              d="M 152 208 C 145 185 140 160 144 140 C 135 155 130 180 135 205 C 138 215 145 220 152 208 Z"
              fill={deepShadowColor}
              opacity="0.8"
            />
            {/* Left Arm Elbow Fold Creases */}
            <path
              d="M 102 215 C 88 230 75 248 68 265"
              stroke={shadowFoldColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 104 218 C 90 233 77 251 70 268"
              stroke={highlightColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Left Ribbed Cuff */}
            <path
              d="M 46 276 L 56 307 L 98 318 L 88 288 Z"
              fill={hex}
            />
            <path
              d="M 46 276 L 56 307 L 98 318 L 88 288 Z"
              fill={`url(#${uniqueId}-ribbing)`}
            />
            <path
              d="M 46 276 L 56 307 L 98 318 L 88 288 Z"
              stroke={seamColor}
              strokeWidth="2"
            />
          </g>

          {/* Right Sleeve (Viewer's Right) */}
          <g>
            <path
              d="M 358 124 L 454 276 C 464 290 458 302 444 307 L 402 318 L 348 208 Z"
              fill={hex}
            />
            <path
              d="M 358 124 L 454 276 C 464 290 458 302 444 307 L 402 318 L 348 208 Z"
              fill={`url(#${uniqueId}-right-arm-grad)`}
            />
            {/* Right Armpit Deep Shadow */}
            <path
              d="M 348 208 C 355 185 360 160 356 140 C 365 155 370 180 365 205 C 362 215 355 220 348 208 Z"
              fill={deepShadowColor}
              opacity="0.8"
            />
            {/* Right Arm Elbow Fold Creases */}
            <path
              d="M 398 215 C 412 230 425 248 432 265"
              stroke={shadowFoldColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 396 218 C 410 233 423 251 430 268"
              stroke={highlightColor}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Right Ribbed Cuff */}
            <path
              d="M 454 276 L 444 307 L 402 318 L 412 288 Z"
              fill={hex}
            />
            <path
              d="M 454 276 L 444 307 L 402 318 L 412 288 Z"
              fill={`url(#${uniqueId}-ribbing)`}
            />
            <path
              d="M 454 276 L 444 307 L 402 318 L 412 288 Z"
              stroke={seamColor}
              strokeWidth="2"
            />
          </g>

          {/* -------------------- MAIN TORSO BODY -------------------- */}
          <g>
            {/* Body Contour with Drop Shoulder Curves */}
            <path
              d="M 144 122 C 185 132 315 132 356 122 L 374 485 C 374 502 358 514 336 514 L 164 514 C 142 514 126 502 126 485 Z"
              fill={hex}
            />
            {/* Cylindrical Torso Gradient */}
            <path
              d="M 144 122 C 185 132 315 132 356 122 L 374 485 C 374 502 358 514 336 514 L 164 514 C 142 514 126 502 126 485 Z"
              fill={`url(#${uniqueId}-torso-grad)`}
            />
            {/* Top-to-Bottom Specular Light */}
            <path
              d="M 144 122 C 185 132 315 132 356 122 L 374 485 C 374 502 358 514 336 514 L 164 514 C 142 514 126 502 126 485 Z"
              fill={`url(#${uniqueId}-vertical-light)`}
            />

            {/* Drop Shoulder Seam Curves (Streetwear Oversized Fit Cut) */}
            <path
              d="M 144 122 C 158 152 168 185 174 205"
              stroke={seamColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 147 122 C 161 152 171 185 177 205"
              stroke={seamColor}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
            <path
              d="M 356 122 C 342 152 332 185 326 205"
              stroke={seamColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 353 122 C 339 152 329 185 323 205"
              stroke={seamColor}
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />

            {/* Subtle Natural Chest/Torso Fabric Drapes */}
            <g opacity="0.35">
              <path
                d="M 152 230 C 180 248 230 252 270 244"
                stroke={shadowFoldColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 154 233 C 182 251 232 255 272 247"
                stroke={highlightColor}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M 346 235 C 320 250 270 254 230 248"
                stroke={shadowFoldColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </g>

            {/* Heavyweight Ribbed Bottom Hem Band */}
            <g>
              <path
                d="M 126 476 L 374 476 L 372 514 L 128 514 Z"
                fill={hex}
              />
              <path
                d="M 126 476 L 374 476 L 372 514 L 128 514 Z"
                fill={`url(#${uniqueId}-ribbing)`}
              />
              <path
                d="M 126 476 L 374 476 L 372 514 L 128 514 Z"
                fill="rgba(0,0,0,0.18)"
              />
              {/* Hem Top Dual Seam */}
              <line x1="126" y1="476" x2="374" y2="476" stroke={seamColor} strokeWidth="3" />
              <line x1="127" y1="480" x2="373" y2="480" stroke={seamColor} strokeWidth="1.2" strokeDasharray="4 3" />
              {/* Hem bottom fold shadow */}
              <path d="M 128 514 C 180 520 320 520 372 514" stroke={shadowFoldColor} strokeWidth="3" />
            </g>
          </g>

          {/* -------------------- FRONT VIEW SPECIFIC FEATURES -------------------- */}
          {side === 'front' && (
            <>
              {/* POCKETS: Kangaroo Pouch (Pullover/Kids) OR Split Pockets (Zipper) */}
              {(imageType === 'pullover' || imageType === 'kids') && (
                <g>
                  {/* Kangaroo Pocket Outer Shape */}
                  <path
                    d="M 172 355 L 328 355 L 354 445 L 146 445 Z"
                    fill={hex}
                  />
                  {/* Pocket Shadow & Depth */}
                  <path
                    d="M 172 355 L 328 355 L 354 445 L 146 445 Z"
                    fill={`url(#${uniqueId}-torso-grad)`}
                  />
                  {/* Pocket Top Seam with Bar-tacks */}
                  <line x1="172" y1="355" x2="328" y2="355" stroke={seamColor} strokeWidth="3.5" />
                  <line x1="173" y1="359" x2="327" y2="359" stroke={seamColor} strokeWidth="1.5" strokeDasharray="3 2" />
                  {/* Left Hand Pocket Opening & Welt */}
                  <line x1="146" y1="445" x2="172" y2="355" stroke={seamColor} strokeWidth="4" strokeLinecap="round" />
                  <path d="M 148 440 L 170 365" stroke={shadowFoldColor} strokeWidth="3" opacity="0.6" />
                  {/* Right Hand Pocket Opening & Welt */}
                  <line x1="354" y1="445" x2="328" y2="355" stroke={seamColor} strokeWidth="4" strokeLinecap="round" />
                  <path d="M 352 440 L 330 365" stroke={shadowFoldColor} strokeWidth="3" opacity="0.6" />
                  {/* Reinforcement Bar-Tacks at Stress Points */}
                  <rect x="170" y="353" width="6" height="4" rx="1" fill="#39FF14" opacity="0.6" />
                  <rect x="324" y="353" width="6" height="4" rx="1" fill="#39FF14" opacity="0.6" />
                </g>
              )}

              {imageType === 'zipper' && (
                <g>
                  {/* Left Split Pocket */}
                  <path
                    d="M 172 355 L 244 355 L 244 445 L 146 445 Z"
                    fill={hex}
                  />
                  <path
                    d="M 172 355 L 244 355 L 244 445 L 146 445 Z"
                    fill="rgba(0,0,0,0.12)"
                  />
                  <line x1="172" y1="355" x2="244" y2="355" stroke={seamColor} strokeWidth="3" />
                  <line x1="146" y1="445" x2="172" y2="355" stroke={seamColor} strokeWidth="4" />

                  {/* Right Split Pocket */}
                  <path
                    d="M 256 355 L 328 355 L 354 445 L 256 445 Z"
                    fill={hex}
                  />
                  <path
                    d="M 256 355 L 328 355 L 354 445 L 256 445 Z"
                    fill="rgba(0,0,0,0.12)"
                  />
                  <line x1="256" y1="355" x2="328" y2="355" stroke={seamColor} strokeWidth="3" />
                  <line x1="354" y1="445" x2="328" y2="355" stroke={seamColor} strokeWidth="4" />
                </g>
              )}

              {imageType === 'jacket' && (
                <g>
                  {/* Side Welt Hand Pockets with Metal Zippers */}
                  <line x1="158" y1="365" x2="182" y2="450" stroke={seamColor} strokeWidth="5" strokeLinecap="round" />
                  <line x1="160" y1="370" x2="180" y2="445" stroke="#71717a" strokeWidth="2" strokeDasharray="3 2" />
                  <circle cx="160" cy="372" r="3" fill="#d4d4d8" />

                  <line x1="342" y1="365" x2="318" y2="450" stroke={seamColor} strokeWidth="5" strokeLinecap="round" />
                  <line x1="340" y1="370" x2="320" y2="445" stroke="#71717a" strokeWidth="2" strokeDasharray="3 2" />
                  <circle cx="340" cy="372" r="3" fill="#d4d4d8" />
                </g>
              )}

              {/* CENTRAL ZIPPER TRACK FOR ZIPPER HOODIE AND JACKET */}
              {(imageType === 'zipper' || imageType === 'jacket') && (
                <g>
                  {/* Zipper Fabric Placket Welts */}
                  <line x1="247" y1="110" x2="247" y2="476" stroke={seamColor} strokeWidth="1.5" />
                  <line x1="253" y1="110" x2="253" y2="476" stroke={seamColor} strokeWidth="1.5" />
                  {/* Zipper Metal Teeth */}
                  <line x1="250" y1="108" x2="250" y2="476" stroke="#27272a" strokeWidth="5" />
                  <line x1="250" y1="108" x2="250" y2="476" stroke="#e4e4e7" strokeWidth="3" strokeDasharray="3 2" />
                  {/* Metal Zipper Slider with Pull-Tab */}
                  <g transform="translate(244, 215)">
                    {/* Shadow under slider */}
                    <rect x="-1" y="0" width="14" height="18" rx="3" fill="rgba(0,0,0,0.5)" />
                    {/* Metal Slider Body */}
                    <rect x="0" y="1" width="12" height="15" rx="2.5" fill="#e4e4e7" stroke="#71717a" strokeWidth="1" />
                    {/* Slider Notch */}
                    <rect x="3" y="3" width="6" height="5" rx="1" fill="#71717a" />
                    {/* Hanging Metal Pull Tab with Ring Hole */}
                    <path
                      d="M 4 14 L 8 14 L 9 28 C 9 30 7 31 6 31 C 5 31 3 30 3 28 Z"
                      fill="#d4d4d8"
                      stroke="#52525b"
                      strokeWidth="1"
                    />
                    <circle cx="6" cy="24" r="1.5" fill="#3f3f46" />
                  </g>
                </g>
              )}

              {/* HOOD OR STAND-UP COLLAR */}
              {imageType === 'jacket' ? (
                // Stand-up Athletic Fleece Collar
                <g>
                  <path
                    d="M 186 122 C 186 65 314 65 314 122 L 290 138 C 265 144 235 144 210 138 Z"
                    fill={hex}
                    stroke={seamColor}
                    strokeWidth="3"
                  />
                  {/* Collar Inner Lining */}
                  <path
                    d="M 194 120 C 196 80 304 80 306 120 C 275 132 225 132 194 120 Z"
                    fill="rgba(0,0,0,0.35)"
                  />
                  {/* Collar Top Stitch */}
                  <path
                    d="M 190 74 C 230 66 270 66 310 74"
                    stroke={seamColor}
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                </g>
              ) : (
                // 3D Realistic Double-Lined Hood with Eyelets and Drawstrings
                <g>
                  {/* Outer Hood Contour */}
                  <path
                    d="M 174 122 C 168 32 332 32 326 122 C 290 148 210 148 174 122 Z"
                    fill={hex}
                  />
                  <path
                    d="M 174 122 C 168 32 332 32 326 122 C 290 148 210 148 174 122 Z"
                    fill={`url(#${uniqueId}-torso-grad)`}
                  />
                  <path
                    d="M 174 122 C 168 32 332 32 326 122 C 290 148 210 148 174 122 Z"
                    stroke={seamColor}
                    strokeWidth="3"
                  />

                  {/* Deep Inner Hood Opening & Lining */}
                  <path
                    d="M 192 120 C 198 55 302 55 308 120 C 280 142 220 142 192 120 Z"
                    fill="rgba(0, 0, 0, 0.65)"
                  />

                  {/* Brand Woven Neck Label Inside Collar */}
                  <g transform="translate(225, 96)">
                    <rect x="0" y="0" width="50" height="24" rx="2" fill="#18181b" stroke="#39FF14" strokeWidth="1" />
                    <text x="25" y="11" fill="#39FF14" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      SALAPEED
                    </text>
                    <text x="25" y="19" fill="#a1a1aa" fontSize="5.5" fontFamily="monospace" textAnchor="middle">
                      380 GSM · BH
                    </text>
                  </g>

                  {/* Hood Seam Cross-Peak */}
                  <path
                    d="M 250 35 L 250 78"
                    stroke={seamColor}
                    strokeWidth="2.5"
                    strokeDasharray="5 3"
                  />

                  {/* Metal Drawstring Eyelets/Grommets */}
                  <g>
                    {/* Left Eyelet */}
                    <circle cx="218" cy="138" r="4.5" fill="#52525b" stroke="#d4d4d8" strokeWidth="1.5" />
                    <circle cx="218" cy="138" r="2.2" fill="#18181b" />

                    {/* Right Eyelet */}
                    <circle cx="282" cy="138" r="4.5" fill="#52525b" stroke="#d4d4d8" strokeWidth="1.5" />
                    <circle cx="282" cy="138" r="2.2" fill="#18181b" />
                  </g>

                  {/* Realistic Natural Braided Drawstrings Hanging with Aglets */}
                  <g>
                    {/* Left Drawstring Cord */}
                    <path
                      d="M 218 140 C 215 168 212 198 216 230"
                      stroke={drawstringCordColor}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 218 140 C 215 168 212 198 216 230"
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    {/* Left Silver Metal Aglet */}
                    <rect x="214" y="230" width="4.5" height="11" rx="1.5" fill={agletColor} stroke="#4b5563" strokeWidth="0.8" />

                    {/* Right Drawstring Cord */}
                    <path
                      d="M 282 140 C 285 168 288 198 284 230"
                      stroke={drawstringCordColor}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 282 140 C 285 168 288 198 284 230"
                      stroke="rgba(0,0,0,0.15)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    {/* Right Silver Metal Aglet */}
                    <rect x="282" y="230" width="4.5" height="11" rx="1.5" fill={agletColor} stroke="#4b5563" strokeWidth="0.8" />
                  </g>
                </g>
              )}
            </>
          )}

          {/* -------------------- BACK VIEW SPECIFIC FEATURES -------------------- */}
          {side === 'back' && (
            <g>
              {/* Back of Hood Draped Down Naturally on Upper Back */}
              <path
                d="M 182 108 C 188 44 312 44 318 108 C 314 178 186 178 182 108 Z"
                fill={hex}
              />
              <path
                d="M 182 108 C 188 44 312 44 318 108 C 314 178 186 178 182 108 Z"
                fill={`url(#${uniqueId}-torso-grad)`}
              />
              <path
                d="M 182 108 C 188 44 312 44 318 108 C 314 178 186 178 182 108 Z"
                stroke={seamColor}
                strokeWidth="3"
              />

              {/* Hood Draped Under-Shadow on Back Canvas */}
              <path
                d="M 184 140 C 215 188 285 188 316 140 C 310 182 190 182 184 140 Z"
                fill={deepShadowColor}
                opacity="0.6"
              />

              {/* Center Hood Spine Seam */}
              <path
                d="M 250 50 L 250 172"
                stroke={seamColor}
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />

              {/* Upper Back Athletic Reinforced Shoulder Yoke */}
              <path
                d="M 154 185 C 210 198 290 198 346 185"
                stroke={seamColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 156 190 C 210 203 290 203 344 190"
                stroke={seamColor}
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />

              {/* Realistic Back Lat / Spine Creases */}
              <g opacity="0.3">
                <path
                  d="M 250 240 L 250 420"
                  stroke={shadowFoldColor}
                  strokeWidth="2"
                  strokeDasharray="12 18"
                />
                <path
                  d="M 205 320 C 225 330 275 330 295 320"
                  stroke={shadowFoldColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            </g>
          )}
        </g>
      )}
    </svg>
  );
};
