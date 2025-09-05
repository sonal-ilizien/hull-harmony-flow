"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
  Hand
} from "lucide-react"

// Types for shapes and metadata
type ShapeType = "rect" | "circle" | "triangle" | "star"

interface Shape {
  id: number
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  r: number
  fill: string
  stroke: string
  metadata?: {
    label?: string
    severity?: "Low" | "Medium" | "High"
    color?: string
  }
}

const LOCAL_STORAGE_KEY = 'drawing-app-state';

export default function Drawing() {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedShape, setSelectedShape] = useState<number | null>(null)
  const [shapeMetadata, setShapeMetadata] = useState<Shape["metadata"]>({})
  const [shapeWidth, setShapeWidth] = useState<number>(0);
  const [shapeHeight, setShapeHeight] = useState<number>(0);
  const [shapeRadius, setShapeRadius] = useState<number>(0);
  const [showGrid, setShowGrid] = useState(true)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [currentTool, setCurrentTool] = useState<ShapeType | "hand" | null>("rect")
  const [scale, setScale] = useState(1) // State for zoom level
  const [viewBox, setViewBox] = useState("0 0 800 500");
  const svgRef = useRef<SVGSVGElement>(null)
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null)

  // Dragging and resizing state
  const [isDragging, setIsDragging] = useState(false) // for shapes
  const [isResizing, setIsResizing] = useState(false)
  const [isPanning, setIsPanning] = useState(false); // for canvas
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)

  // 🔄 Load shapes and background image from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const { shapes: savedShapes, backgroundImage: savedImage } = JSON.parse(savedState);
        if (savedShapes) setShapes(savedShapes);
        if (savedImage) setBackgroundImage(savedImage);
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  // 💾 Save shapes and background image to localStorage whenever they change
  useEffect(() => {
    try {
      const stateToSave = {
        shapes,
        backgroundImage,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state to localStorage", error);
    }
  }, [shapes, backgroundImage]);

  // Function to get mouse position relative to SVG
  const getSVGPoint = (e: React.MouseEvent) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    // Get the inverse of the matrix for scaling and translate back to original coords
    const ctm = svg.getScreenCTM()?.inverse()
    return pt.matrixTransform(ctm)
  }

  // Handle mouse down on canvas or shapes
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const svgPoint = getSVGPoint(e)
    setStartPoint(svgPoint)

    if (currentTool === "hand") {
      setIsPanning(true);
      e.preventDefault();
    } else if (currentTool) {
      // If a tool is selected, add a new shape on click
      let newShape: Shape | null = null;
      const defaultProps = {
        id: Date.now(),
        fill: "#FFFFFF",
        stroke: "#000000",
        metadata: { label: "New Annotation", severity: "Low" as "Low" | "Medium" | "High", color: "#FFFFFF" },
      };

      // Default dimensions for new shapes
      const defaultWidth = 100;
      const defaultHeight = 80;

      switch (currentTool) {
        case "rect":
          newShape = { ...defaultProps, type: "rect", x: svgPoint.x - defaultWidth / 2, y: svgPoint.y - defaultHeight / 2, width: defaultWidth, height: defaultHeight, r: 0 };
          break;
        case "circle":
          const radius = Math.min(defaultWidth, defaultHeight) / 2;
          newShape = { ...defaultProps, type: "circle", x: svgPoint.x, y: svgPoint.y, width: 0, height: 0, r: radius };
          break;
        case "triangle":
          newShape = { ...defaultProps, type: "triangle", x: svgPoint.x, y: svgPoint.y, width: defaultWidth, height: defaultHeight, r: 0, metadata: { ...defaultProps.metadata, label: "New Triangle" } };
          break;
        case "star":
          newShape = { ...defaultProps, type: "star", x: svgPoint.x, y: svgPoint.y, width: defaultWidth, height: defaultHeight, r: 0, metadata: { ...defaultProps.metadata, label: "New Star" } };
          break;
      }

      if (newShape) {
        setShapes([...shapes, newShape]);
        setSelectedShape(newShape.id);
        setShapeMetadata(newShape.metadata || {});
        setShapeWidth(newShape.width);
        setShapeHeight(newShape.height);
        setShapeRadius(newShape.r);
      }
      setCurrentTool(null); // Deselect the tool after drawing
      e.preventDefault();
    } else if (target.dataset.type === "handle") {
      // If a resize handle is clicked, start resizing
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || null);
      e.stopPropagation();
    } else if (target.tagName === "rect" || target.tagName === "circle" || target.tagName === "path") {
      // If a shape is clicked, select it and start dragging
      const shapeId = parseInt(target.dataset.id || "", 10);
      setSelectedShape(shapeId);
      const shape = shapes.find((s) => s.id === shapeId);
      if (shape) {
        setShapeMetadata(shape.metadata || {});
        setShapeWidth(shape.width);
        setShapeHeight(shape.height);
        setShapeRadius(shape.r);
        setDragOffset({ x: svgPoint.x - shape.x, y: svgPoint.y - shape.y });
        setIsDragging(true);
      }
      e.stopPropagation();
    } else {
      // Deselect if clicking on the canvas
      setSelectedShape(null);
      setShapeMetadata({});
    }
  }

  // Handle mouse move for dragging and resizing
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && !isResizing && !isPanning) return;

    const svgPoint = getSVGPoint(e);

    if (isPanning) {
      const dx = svgPoint.x - startPoint.x;
      const dy = svgPoint.y - startPoint.y;
      const [vx, vy, vw, vh] = viewBox.split(" ").map(Number);
      const newViewBox = `${vx - dx} ${vy - dy} ${vw} ${vh}`;
      setViewBox(newViewBox);
      setStartPoint(svgPoint);
    } else if (isDragging) {
      // Update position for dragging
      setShapes((prev) =>
        prev.map((s) =>
          s.id === selectedShape
            ? { ...s, x: svgPoint.x - dragOffset.x, y: svgPoint.y - dragOffset.y }
            : s
        )
      );
    } else if (isResizing) {
      // Update dimensions for resizing
      setShapes((prev) =>
        prev.map((s) => {
          if (s.id !== selectedShape) return s;
          const deltaX = svgPoint.x - startPoint.x;
          const deltaY = svgPoint.y - startPoint.y;

          let newWidth = s.width;
          let newHeight = s.height;
          let newR = s.r;
          let newX = s.x;
          let newY = s.y;

          switch (s.type) {
            case "rect":
              switch (resizeHandle) {
                case "top-left":
                  newWidth = s.width - deltaX;
                  newHeight = s.height - deltaY;
                  newX = s.x + deltaX;
                  newY = s.y + deltaY;
                  break;
                case "top-right":
                  newWidth = s.width + deltaX;
                  newHeight = s.height - deltaY;
                  newY = s.y + deltaY;
                  break;
                case "bottom-left":
                  newWidth = s.width - deltaX;
                  newHeight = s.height + deltaY;
                  newX = s.x + deltaX;
                  break;
                case "bottom-right":
                  newWidth = s.width + deltaX;
                  newHeight = s.height + deltaY;
                  break;
              }
              return { ...s, width: Math.max(newWidth, 10), height: Math.max(newHeight, 10), x: newX, y: newY };
            case "circle":
              switch (resizeHandle) {
                case "bottom-right":
                  newR = s.r + (deltaX + deltaY) / 2;
                  break;
              }
              return { ...s, r: Math.max(newR, 5) };
            case "triangle":
            case "star":
              switch (resizeHandle) {
                case "top-left":
                  newWidth = s.width - deltaX;
                  newHeight = s.height - deltaY;
                  newX = s.x + deltaX;
                  newY = s.y + deltaY;
                  break;
                case "top-right":
                  newWidth = s.width + deltaX;
                  newHeight = s.height - deltaY;
                  newY = s.y + deltaY;
                  break;
                case "bottom-left":
                  newWidth = s.width - deltaX;
                  newHeight = s.height + deltaY;
                  newX = s.x + deltaX;
                  break;
                case "bottom-right":
                  newWidth = s.width + deltaX;
                  newHeight = s.height + deltaY;
                  break;
              }
              return { ...s, width: Math.max(newWidth, 10), height: Math.max(newHeight, 10), x: newX, y: newY };
            default:
              return s;
          }
        })
      );
      setStartPoint(svgPoint); // Update start point for continuous resizing
    }
  }

  // Handle mouse up to end dragging/resizing
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsPanning(false);
    setResizeHandle(null);
  }

  // Attach mouse listeners
  useEffect(() => {
    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('mousemove', handleMouseMove as any);
      svgElement.addEventListener('mouseup', handleMouseUp as any);
    }
    return () => {
      if (svgElement) {
        svgElement.removeEventListener('mousemove', handleMouseMove as any);
        svgElement.removeEventListener('mouseup', handleMouseUp as any);
      }
    }
  }, [isDragging, isResizing, isPanning, shapes, selectedShape, startPoint]);


  const deleteShape = () => {
    if (selectedShape === null) return;
    setShapes(shapes.filter((s) => s.id !== selectedShape));
    setSelectedShape(null);
    setShapeMetadata({});
  }

  const updateMetadata = () => {
    if (selectedShape === null) return;
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id === selectedShape) {
          const updatedShape = {
            ...s,
            metadata: {
              ...shapeMetadata,
              color: shapeMetadata?.color || s.fill
            },
            fill: shapeMetadata?.color || s.fill,
          };
          // Update dimensions based on shape type
          if (s.type === "circle") {
            updatedShape.r = shapeRadius;
          } else {
            updatedShape.width = shapeWidth;
            updatedShape.height = shapeHeight;
          }
          return updatedShape;
        }
        return s;
      })
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBackgroundImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  const exportAsImage = async (format: 'png' | 'pdf') => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    // Create a temporary canvas
    let canvas = tempCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      tempCanvasRef.current = canvas;
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      canvas.width = svgElement.viewBox.baseVal.width;
      canvas.height = svgElement.viewBox.baseVal.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }

      if (format === 'png') {
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'drawing.png';
        link.click();
      } else if (format === 'pdf') {
        if (typeof (window as any).jsPDF === 'undefined') {
          console.error('jsPDF not loaded');
          return;
        }
        const { jsPDF } = (window as any).jspdf;
        const pdf = new jsPDF('p', 'px', [canvas.width, canvas.height]);
        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save('drawing.pdf');
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  const exportAsSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "drawing.svg";
    link.click();
  }

  // Zoom functions
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));

  const getCursorStyle = () => {
    if (isResizing) return "se-resize";
    if (isDragging) return "grabbing";
    if (isPanning) return "grabbing";
    if (currentTool === "hand") return "grab";
    if (currentTool) return "crosshair";
    return "default";
  }

  const getSelectedShape = () => {
    return shapes.find(s => s.id === selectedShape);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Toolbar */}
      <div className="w-64 p-4 border-r bg-gray-50 space-y-4 rounded-md">
        <h2 className="font-bold mb-2 text-xl">Toolbar</h2>

        <div className="space-y-2">
            <Label htmlFor="shape-select">Select Tool</Label>
            <select
                id="shape-select"
                value={currentTool || ""}
                onChange={(e) => setCurrentTool(e.target.value as ShapeType | "hand" | null)}
                className="border rounded w-full p-2 shadow-sm"
            >
                <option value="rect">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
                <option value="star">Star</option>
                <option value="hand">Hand Tool</option>
            </select>
        </div>
        <hr className="my-4" />
        <h3 className="font-bold text-lg">Tools</h3>
        <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={() => setCurrentTool("hand")}>
          <Hand className="mr-2 h-4 w-4" /> Hand Tool
        </Button>
        <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={deleteShape}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
        <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={handleZoomIn}>
          <ZoomIn className="mr-2 h-4 w-4" /> Zoom In
        </Button>
        <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={handleZoomOut}>
          <ZoomOut className="mr-2 h-4 w-4" /> Zoom Out
        </Button>
        <Button variant="outline" asChild className="w-full rounded-lg shadow-sm">
          <label>
            <Upload className="mr-2 h-4 w-4" />
            Import Image
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </label>
        </Button>

        <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={() => setShowGrid(!showGrid)}>
          Toggle Grid
        </Button>

        <div className="mt-4 space-y-2">
          <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={exportAsSVG}>
            Export SVG
          </Button>
          <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={() => exportAsImage('png')}>
            Export PNG
          </Button>
          <Button variant="outline" className="w-full rounded-lg shadow-sm" onClick={() => exportAsImage('pdf')}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="border bg-white shadow-lg rounded-xl"
          style={{ width: "90%", height: "90%", transform: `scale(${scale})`, transition: 'transform 0.2s', cursor: getCursorStyle() }}
          onMouseDown={handleMouseDown}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccc" strokeWidth="0.5" />
            </pattern>
          </defs>

          {showGrid && <rect width="800" height="500" fill="url(#grid)" />}
          {backgroundImage && (
            <image href={backgroundImage} x="0" y="0" width="800" height="500" />
          )}

          {shapes.map((shape) => {
            const isSelected = selectedShape === shape.id;
            const strokeColor = isSelected ? "red" : shape.stroke;
            const strokeWidth = isSelected ? 3 : 2;
            const strokeDasharray = isSelected ? "5,5" : "0";

            // Function to determine text color based on shape's fill color
            const getTextColor = (bgColor: string) => {
                const hexColor = bgColor.startsWith("#") ? bgColor.substring(1) : bgColor;
                const r = parseInt(hexColor.substring(0, 2), 16);
                const g = parseInt(hexColor.substring(2, 4), 16);
                const b = parseInt(hexColor.substring(4, 6), 16);
                const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                return luminance > 0.5 ? 'black' : 'white';
            };

            const renderLabel = (x: number, y: number) => {
                if (shape.metadata?.label) {
                    return (
                        <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="12"
                            fill={getTextColor(shape.fill)}
                            style={{ pointerEvents: 'none' }}
                        >
                            {shape.metadata.label}
                        </text>
                    );
                }
                return null;
            };

            switch (shape.type) {
              case "rect":
                return (
                  <g key={shape.id}>
                    <rect
                      data-id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      fill={shape.fill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                    />
                    {renderLabel(shape.x + shape.width/2, shape.y + shape.height/2)}
                    {isSelected && (
                      <>
                        <circle data-id={shape.id} data-type="handle" data-handle="top-left" cx={shape.x} cy={shape.y} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="top-right" cx={shape.x + shape.width} cy={shape.y} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="bottom-left" cx={shape.x} cy={shape.y + shape.height} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="bottom-right" cx={shape.x + shape.width} cy={shape.y + shape.height} r="5" fill="dodgerblue" stroke="black" />
                      </>
                    )}
                  </g>
                );
              case "circle":
                return (
                  <g key={shape.id}>
                    <circle
                      data-id={shape.id}
                      cx={shape.x}
                      cy={shape.y}
                      r={shape.r}
                      fill={shape.fill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                    />
                    {renderLabel(shape.x, shape.y)}
                    {isSelected && (
                      <circle data-id={shape.id} data-type="handle" data-handle="bottom-right" cx={shape.x + shape.r} cy={shape.y + shape.r} r="5" fill="dodgerblue" stroke="black" />
                    )}
                  </g>
                );
              case "triangle":
                const triPath = `M${shape.x},${shape.y - shape.height/2} L${shape.x - shape.width/2},${shape.y + shape.height/2} L${shape.x + shape.width/2},${shape.y + shape.height/2} Z`;
                return (
                  <g key={shape.id}>
                    <path
                      data-id={shape.id}
                      d={triPath}
                      fill={shape.fill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                    />
                    {renderLabel(shape.x, shape.y)}
                    {isSelected && (
                      <>
                        <circle data-id={shape.id} data-type="handle" data-handle="top-left" cx={shape.x - shape.width/2} cy={shape.y + shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="top-right" cx={shape.x + shape.width/2} cy={shape.y + shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="bottom-left" cx={shape.x} cy={shape.y - shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="bottom-right" cx={shape.x} cy={shape.y - shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                      </>
                    )}
                  </g>
                );
              case "star":
                const starPath = `M ${shape.x} ${shape.y - shape.height / 2} L ${shape.x + shape.width * 0.1} ${shape.y - shape.height * 0.15} L ${shape.x + shape.width / 2} ${shape.y - shape.height * 0.15} L ${shape.x + shape.width * 0.2} ${shape.y + shape.height * 0.05} L ${shape.x + shape.width * 0.3} ${shape.y + shape.height * 0.4} L ${shape.x} ${shape.y + shape.height * 0.1} L ${shape.x - shape.width * 0.3} ${shape.y + shape.height * 0.4} L ${shape.x - shape.width * 0.2} ${shape.y + shape.height * 0.05} L ${shape.x - shape.width / 2} ${shape.y - shape.height * 0.15} L ${shape.x - shape.width * 0.1} ${shape.y - shape.height * 0.15} Z`;
                return (
                  <g key={shape.id}>
                    <path
                      data-id={shape.id}
                      d={starPath}
                      fill={shape.fill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                    />
                    {renderLabel(shape.x, shape.y)}
                    {isSelected && (
                      <>
                        <circle data-id={shape.id} data-type="handle" data-handle="top-left" cx={shape.x - shape.width/2} cy={shape.y - shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="top-right" cx={shape.x + shape.width/2} cy={shape.y - shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="bottom-left" cx={shape.x - shape.width/2} cy={shape.y + shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                        <circle data-id={shape.id} data-type="handle" data-handle="bottom-right" cx={shape.x + shape.width/2} cy={shape.y + shape.height/2} r="5" fill="dodgerblue" stroke="black" />
                      </>
                    )}
                  </g>
                );
              default:
                return null;
            }
          })}
        </svg>
        <canvas ref={tempCanvasRef} style={{ display: 'none' }} />
      </div>

      {/* Right Panel */}
      <div className="w-64 p-4 border-l bg-gray-50 space-y-4 rounded-md">
        <h2 className="font-bold mb-2 text-xl">Metadata</h2>
        {selectedShape !== null ? (
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input
                value={shapeMetadata?.label || ""}
                onChange={(e) =>
                  setShapeMetadata((prev) => ({ ...prev, label: e.target.value }))
                }
                className="rounded-lg shadow-sm"
              />
            </div>
            <div>
              <Label>Severity</Label>
              <select
                className="border rounded w-full p-2 shadow-sm"
                value={shapeMetadata?.severity || "Low"}
                onChange={(e) =>
                  setShapeMetadata((prev) => ({
                    ...prev,
                    severity: e.target.value as "Low" | "Medium" | "High",
                  }))
                }
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            {getSelectedShape()?.type === 'circle' ? (
                <div>
                    <Label>Radius</Label>
                    <Input
                        type="number"
                        value={shapeRadius}
                        onChange={(e) => setShapeRadius(Number(e.target.value))}
                        className="rounded-lg shadow-sm"
                    />
                </div>
            ) : (
                <>
                    <div>
                        <Label>Width</Label>
                        <Input
                            type="number"
                            value={shapeWidth}
                            onChange={(e) => setShapeWidth(Number(e.target.value))}
                            className="rounded-lg shadow-sm"
                        />
                    </div>
                    <div>
                        <Label>Height</Label>
                        <Input
                            type="number"
                            value={shapeHeight}
                            onChange={(e) => setShapeHeight(Number(e.target.value))}
                            className="rounded-lg shadow-sm"
                        />
                    </div>
                </>
            )}
            <div>
              <Label>Fill Color</Label>
              <Input
                type="color"
                value={shapeMetadata?.color || "#FFFFFF"}
                onChange={(e) =>
                  setShapeMetadata((prev) => ({ ...prev, color: e.target.value }))
                }
                className="rounded-lg shadow-sm"
              />
            </div>
            <Button className="w-full rounded-lg shadow-sm" onClick={updateMetadata}>
              Update
            </Button>
          </div>
        ) : (
          <p className="text-gray-500">Select a shape to edit metadata</p>
        )}
      </div>
    </div>
  );
}