import React, { useEffect, useRef, useState } from 'react';
import { Upload, Type, Download, Trash2, ZoomIn, ZoomOut, ImagePlus } from 'lucide-react';

const CorrugatedBoxDieline = () => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');

  useEffect(() => {
    // Import Fabric.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
    script.async = true;
    script.onload = initCanvas;
    document.body.appendChild(script);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, []);

  const initCanvas = () => {
    if (!window.fabric || fabricCanvasRef.current) return;

    const canvas = new window.fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#f5f5f5'
    });

    fabricCanvasRef.current = canvas;

    // Draw corrugated box dieline (RSC - Regular Slotted Container)
    drawDieline(canvas);

    // Handle object selection
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });
  };

  const drawDieline = (canvas) => {
    const boxWidth = 200;
    const boxHeight = 150;
    const boxDepth = 100;
    const flapHeight = 50;
    const centerX = 400;
    const centerY = 300;

    const dielineColor = '#0066cc';
    const strokeWidth = 2;

    // Main box body
    const mainBox = new window.fabric.Rect({
      left: centerX - boxWidth / 2,
      top: centerY - boxHeight / 2,
      width: boxWidth,
      height: boxHeight,
      fill: 'transparent',
      stroke: dielineColor,
      strokeWidth: strokeWidth,
      selectable: false
    });

    // Left flap
    const leftFlap = new window.fabric.Rect({
      left: centerX - boxWidth / 2 - boxDepth,
      top: centerY - boxHeight / 2,
      width: boxDepth,
      height: boxHeight,
      fill: 'transparent',
      stroke: dielineColor,
      strokeWidth: strokeWidth,
      selectable: false
    });

    // Right flap
    const rightFlap = new window.fabric.Rect({
      left: centerX + boxWidth / 2,
      top: centerY - boxHeight / 2,
      width: boxDepth,
      height: boxHeight,
      fill: 'transparent',
      stroke: dielineColor,
      strokeWidth: strokeWidth,
      selectable: false
    });

    // Top flaps
    const topLeftFlap = new window.fabric.Rect({
      left: centerX - boxWidth / 2,
      top: centerY - boxHeight / 2 - flapHeight,
      width: boxWidth / 2,
      height: flapHeight,
      fill: 'transparent',
      stroke: dielineColor,
      strokeWidth: strokeWidth,
      selectable: false
    });

    const topRightFlap = new window.fabric.Rect({
      left: centerX,
      top: centerY - boxHeight / 2 - flapHeight,
      width: boxWidth / 2,
      height: flapHeight,
      fill: 'transparent',
      stroke: dielineColor,
      strokeWidth: strokeWidth,
      selectable: false
    });

    // Bottom flaps
    const bottomLeftFlap = new window.fabric.Rect({
      left: centerX - boxWidth / 2,
      top: centerY + boxHeight / 2,
      width: boxWidth / 2,
      height: flapHeight,
      fill: 'transparent',
      stroke: dielineColor,
      strokeWidth: strokeWidth,
      selectable: false
    });

    const bottomRightFlap = new window.fabric.Rect({
      left: centerX,
      top: centerY + boxHeight / 2,
      width: boxWidth / 2,
      height: flapHeight,
      fill: 'transparent',
      stroke: dielineColor,
      strokeWidth: strokeWidth,
      selectable: false
    });

    // Add fold lines (dashed)
    const foldLineStyle = {
      stroke: '#999999',
      strokeWidth: 1,
      strokeDashArray: [5, 5],
      selectable: false
    };

    const foldLine1 = new window.fabric.Line([
      centerX - boxWidth / 2, centerY - boxHeight / 2,
      centerX - boxWidth / 2, centerY + boxHeight / 2
    ], foldLineStyle);

    const foldLine2 = new window.fabric.Line([
      centerX + boxWidth / 2, centerY - boxHeight / 2,
      centerX + boxWidth / 2, centerY + boxHeight / 2
    ], foldLineStyle);

    const foldLine3 = new window.fabric.Line([
      centerX, centerY - boxHeight / 2 - flapHeight,
      centerX, centerY - boxHeight / 2
    ], foldLineStyle);

    const foldLine4 = new window.fabric.Line([
      centerX, centerY + boxHeight / 2,
      centerX, centerY + boxHeight / 2 + flapHeight
    ], foldLineStyle);

    canvas.add(mainBox, leftFlap, rightFlap);
    canvas.add(topLeftFlap, topRightFlap, bottomLeftFlap, bottomRightFlap);
    canvas.add(foldLine1, foldLine2, foldLine3, foldLine4);
  };

  const addText = () => {
    if (!fabricCanvasRef.current || !textInput.trim()) return;

    const text = new window.fabric.IText(textInput, {
      left: 400,
      top: 300,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'Arial'
    });

    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
    fabricCanvasRef.current.renderAll();
    setTextInput('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      window.fabric.Image.fromURL(event.target.result, (img) => {
        img.scale(0.5);
        img.set({
          left: 350,
          top: 250
        });
        fabricCanvasRef.current.add(img);
        fabricCanvasRef.current.setActiveObject(img);
        fabricCanvasRef.current.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const deleteSelected = () => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject && activeObject.selectable !== false) {
      fabricCanvasRef.current.remove(activeObject);
      fabricCanvasRef.current.renderAll();
    }
  };

  const exportDesign = () => {
    if (!fabricCanvasRef.current) return;
    const dataURL = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1
    });
    const link = document.createElement('a');
    link.download = 'corrugated-box-dieline.png';
    link.href = dataURL;
    link.click();
  };

  const zoomIn = () => {
    if (!fabricCanvasRef.current) return;
    const zoom = fabricCanvasRef.current.getZoom();
    fabricCanvasRef.current.setZoom(zoom * 1.1);
  };

  const zoomOut = () => {
    if (!fabricCanvasRef.current) return;
    const zoom = fabricCanvasRef.current.getZoom();
    fabricCanvasRef.current.setZoom(zoom * 0.9);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Corrugated Box Dieline Designer</h1>
            <p className="text-blue-100">Tambahkan teks dan gambar ke desain box Anda</p>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Toolbar */}
            <div className="lg:w-80 bg-gray-50 p-6 border-r border-gray-200">
              <div className="space-y-6">
                {/* Add Text Section */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Type className="w-5 h-5 mr-2 text-blue-600" />
                    Tambah Text
                  </h3>
                  <input
                    type="text"
                    placeholder="Masukkan teks..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Ukuran</label>
                      <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Warna</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <button
                    onClick={addText}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    Tambah Text
                  </button>
                </div>

                {/* Add Image Section */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <ImagePlus className="w-5 h-5 mr-2 text-green-600" />
                    Tambah Gambar
                  </h3>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Gambar
                  </button>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">Aksi</h3>
                  <div className="space-y-2">
                    <button
                      onClick={zoomIn}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <ZoomIn className="w-5 h-5 mr-2" />
                      Zoom In
                    </button>
                    <button
                      onClick={zoomOut}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <ZoomOut className="w-5 h-5 mr-2" />
                      Zoom Out
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Hapus Objek
                    </button>
                    <button
                      onClick={exportDesign}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Export PNG
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-2">📦 Tips:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• Klik objek untuk memilih</li>
                    <li>• Drag untuk memindahkan</li>
                    <li>• Gunakan handle untuk resize</li>
                    <li>• Double-click text untuk edit</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 p-6 bg-white">
              <div className="flex items-center justify-center">
                <div className="border-4 border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <canvas ref={canvasRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrugatedBoxDieline;