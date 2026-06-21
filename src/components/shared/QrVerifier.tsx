import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';

interface QrVerifierProps {
  value: string;
  label?: string;
  size?: number;
  showScanText?: boolean;
}

/**
 * Deterministic vector QR Code generator for HR document verification
 * Generates highly realistic, unique vector layouts based on document metadata hash.
 */
export const QrVerifier: React.FC<QrVerifierProps> = ({
  value,
  label = "DOC VERIFICATION",
  size = 90,
  showScanText = true
}) => {
  // Simple hashing algorithm to generate unique grids for different documents
  const grid = useMemo(() => {
    const gridSize = 25; // 25x25 matrix
    const matrix = Array(gridSize).fill(0).map(() => Array(gridSize).fill(false));

    // 1. Helper to draw finder pattern
    const drawFinder = (startX: number, startY: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const isBorder = x === 0 || x === 6 || y === 0 || y === 6;
          const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          if (isBorder || isCenter) {
            matrix[startY + y][startX + x] = true;
          }
        }
      }
    };

    // Draw three finder squares at standard anchors
    drawFinder(0, 0); // Top-Left
    drawFinder(gridSize - 7, 0); // Top-Right
    drawFinder(0, gridSize - 7); // Bottom-Left

    // Draw baby alignment pattern
    matrix[18][18] = true;
    matrix[18][17] = true;
    matrix[18][19] = true;
    matrix[17][18] = true;
    matrix[19][18] = true;

    // 2. Generate deterministic random cells based on value pre-hashed string
    let h = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    const hashNum = Math.abs(h);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder pattern zones
        const isTopLeftFinder = r < 8 && c < 8;
        const isTopRightFinder = r < 8 && c >= gridSize - 8;
        const isBottomLeftFinder = r >= gridSize - 8 && c < 8;

        if (!isTopLeftFinder && !isTopRightFinder && !isBottomLeftFinder) {
          // Skip center logo zone (9x9 to 15x15)
          const isCenterZone = r >= 10 && r <= 14 && c >= 10 && c <= 14;
          if (isCenterZone) continue;

          // Deterministic seed for this cell
          const cellSeed = (r * 133 + c * 7919) ^ hashNum;
          // ~48% fill density for visual realism
          matrix[r][c] = (cellSeed % 100) < 48;
        }
      }
    }

    return matrix;
  }, [value]);

  return (
    <div className="qr-print-layout flex flex-col items-center p-3 bg-white border border-slate-200/60 rounded-xl shadow-xs select-none max-w-fit font-sans transition-all hover:bg-slate-50/50">
      {/* SVG QR Visualization */}
      <div className="relative bg-white p-1 rounded-lg border border-slate-100" style={{ width: size + 8, height: size + 8 }}>
        <svg
          viewBox="0 0 25 25"
          width={size}
          height={size}
          shapeRendering="crispEdges"
          className="text-slate-900 fill-current"
        >
          {grid.map((row, r) =>
            row.map((active, c) =>
              active ? (
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width="1"
                  height="1"
                  className="fill-[#212c46]"
                />
              ) : null
            )
          )}
        </svg>
        {/* Center Secure Logo Nesting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-0.5 rounded-md border border-slate-200 shadow-sm flex items-center justify-center w-[22%] h-[22%]">
          <Icons.ShieldAlert size={12} className="text-[#a94228]" strokeWidth={2.5} />
        </div>
      </div>

      {showScanText && (
        <div className="mt-2 text-center">
          <span className="block text-[8px] font-black text-[#5f7ab7] uppercase tracking-widest leading-none">
            {label}
          </span>
          <span className="block text-[7px] font-bold text-slate-400 mt-0.5 max-w-[120px] leading-tight break-all font-mono select-all">
            {value}
          </span>
        </div>
      )}
    </div>
  );
};
