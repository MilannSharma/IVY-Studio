
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Circle, Star, RegularPolygon, Line, Arrow } from 'react-konva';
import useImage from 'use-image';
import { Template, TemplateElement } from '../constants/templates';
import bwipjs from 'bwip-js';

interface CanvasRendererProps {
  data: Template;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: any) => void;
  scale?: number;
}

const ElementRenderer = ({ el, isSelected, onSelect, onUpdate, onTransformEnd, onStartEdit, isEditing }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [img] = useImage(el.src?.includes('{') ? 'https://ui-avatars.com/api/?name=User&background=random' : el.src || '', 'anonymous');
  const [barcodeUrl, setBarcodeUrl] = useState<string>('');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (el.type === 'barcode' || el.type === 'qr') {
      try {
        const canvas = document.createElement('canvas');
        const options: any = {
          bcid: el.type === 'barcode' ? 'code128' : 'qrcode',
          text: el.content?.replace(/{.*?}/g, '12345') || '12345',
          scale: 3,
          includetext: el.type === 'barcode',
        };
        
        if (el.type === 'barcode') {
          options.height = 10;
        }

        bwipjs.toCanvas(canvas, options);
        setBarcodeUrl(canvas.toDataURL());
      } catch (e) {
        console.error(e);
      }
    }
  }, [el.content, el.type]);

  const [barcodeImg] = useImage(barcodeUrl);

  const commonProps = {
    id: el.id,
    x: el.position.x,
    y: el.position.y,
    width: el.size?.width,
    height: el.size?.height,
    rotation: el.rotation || 0,
    draggable: el.draggable,
    opacity: el.style?.opacity ?? 1,
    onClick: () => onSelect(el.id),
    onTap: () => onSelect(el.id),
    onDragEnd: (e: any) => {
      onUpdate(el.id, {
        position: { x: e.target.x(), y: e.target.y() }
      });
    },
    onTransformEnd: (e: any) => {
      const node = e.target;
      onUpdate(el.id, {
        position: { x: node.x(), y: node.y() },
        size: { width: node.width() * node.scaleX(), height: node.height() * node.scaleY() },
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
    },
    onDblClick: () => el.type === 'text' && onStartEdit(el),
    onDblTap: () => el.type === 'text' && onStartEdit(el),
    ref: shapeRef,
  };

  const renderShape = () => {
    if (el.type === 'text') {
      return (
        <Text
          {...commonProps}
          text={isEditing ? '' : el.content?.replace(/{.*?}/g, (match: string) => match.slice(1, -1).toUpperCase())}
          fontSize={el.style?.fontSize}
          fontFamily={el.style?.fontFamily}
          fontStyle={`${el.style?.fontWeight || ''} ${el.style?.fontStyle || ''}`.trim()}
          fill={el.style?.fill}
          align={el.style?.textAlign}
          width={el.size?.width}
          textDecoration={el.style?.textDecoration}
          letterSpacing={el.style?.letterSpacing}
          visible={!isEditing}
        />
      );
    }

    if (el.type === 'shape') {
      const shapeProps = {
        ...commonProps,
        fill: el.style?.fill,
        stroke: el.style?.stroke,
        strokeWidth: el.style?.strokeWidth,
      };

      if (el.shape === 'circle') {
        return (
          <Circle
            {...shapeProps}
            radius={(el.size?.width || 50) / 2}
          />
        );
      }
      if (el.shape === 'star') {
        return (
          <Star
            {...shapeProps}
            innerRadius={(el.size?.width || 50) / 4}
            outerRadius={(el.size?.width || 50) / 2}
            numPoints={el.points || 5}
          />
        );
      }
      if (el.shape === 'polygon') {
        return (
          <RegularPolygon
            {...shapeProps}
            sides={el.sides || 5}
            radius={(el.size?.width || 50) / 2}
          />
        );
      }
      if (el.shape === 'line') {
        return (
          <Line
            {...shapeProps}
            points={el.points || [0, 0, 100, 100]}
            closed={el.closed !== false}
            tension={0}
          />
        );
      }
      if (el.shape === 'arrow') {
        return (
          <Arrow
            {...shapeProps}
            points={el.points || [0, 0, el.size?.width || 50, 0]}
            pointerLength={10}
            pointerWidth={10}
            pointerAtBeginning={el.pointerAtBeginning}
            fill={el.style?.fill}
            stroke={el.style?.fill}
            strokeWidth={el.style?.strokeWidth || 2}
          />
        );
      }
      return (
        <Rect
          {...shapeProps}
          cornerRadius={el.style?.borderRadius}
        />
      );
    }

    if (el.type === 'image') {
      const clipFunc = (ctx: any) => {
        if (!el.isFrame) return;
        
        const w = el.size?.width || 100;
        const h = el.size?.height || 100;
        
        if (el.frameShape === 'circle') {
          ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2, false);
        } else if (el.frameShape === 'star') {
          const points = el.points || 5;
          const outerRadius = Math.min(w, h) / 2;
          const innerRadius = outerRadius / 2.5;
          const centerX = w / 2;
          const centerY = h / 2;
          
          ctx.moveTo(centerX, centerY - outerRadius);
          for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            ctx.lineTo(centerX + radius * Math.sin(angle), centerY - radius * Math.cos(angle));
          }
        } else if (el.frameShape === 'polygon') {
          const sides = el.sides || 3;
          const radius = Math.min(w, h) / 2;
          const centerX = w / 2;
          const centerY = h / 2;
          
          ctx.moveTo(centerX, centerY - radius);
          for (let i = 1; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            ctx.lineTo(centerX + radius * Math.sin(angle), centerY - radius * Math.cos(angle));
          }
        } else if (el.frameShape === 'heart') {
          const centerX = w / 2;
          const centerY = h / 2;
          const size = Math.min(w, h) * 0.8;
          
          ctx.moveTo(centerX, centerY + size / 4);
          ctx.bezierCurveTo(centerX, centerY - size / 2, centerX - size / 2, centerY - size / 2, centerX - size / 2, centerY);
          ctx.bezierCurveTo(centerX - size / 2, centerY + size / 2, centerX, centerY + size / 2, centerX, centerY + size * 0.75);
          ctx.bezierCurveTo(centerX, centerY + size / 2, centerX + size / 2, centerY + size / 2, centerX + size / 2, centerY);
          ctx.bezierCurveTo(centerX + size / 2, centerY - size / 2, centerX, centerY - size / 2, centerX, centerY + size / 4);
        } else {
          // Default rect with optional border radius
          const r = el.style?.borderRadius || 0;
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.lineTo(w - r, 0);
          ctx.quadraticCurveTo(w, 0, w, r);
          ctx.lineTo(w, h - r);
          ctx.quadraticCurveTo(w, h, w - r, h);
          ctx.lineTo(r, h);
          ctx.quadraticCurveTo(0, h, 0, h - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
        }
      };

      return (
        <KonvaImage
          {...commonProps}
          image={img}
          cornerRadius={el.style?.borderRadius}
          clipFunc={el.isFrame ? clipFunc : undefined}
          stroke={el.style?.stroke}
          strokeWidth={el.style?.strokeWidth}
          strokeScaleEnabled={false}
        />
      );
    }

    if (el.type === 'barcode' || el.type === 'qr') {
      return (
        <KonvaImage
          {...commonProps}
          image={barcodeImg}
        />
      );
    }

    return null;
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};

const CanvasRenderer: React.FC<CanvasRendererProps> = ({ data, selectedId, onSelect, onUpdateElement, scale = 1 }) => {
  const [editingElement, setEditingElement] = useState<TemplateElement | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (el: TemplateElement) => {
    setEditingElement(el);
    setEditValue(el.content || '');
  };

  const handleFinishEdit = () => {
    if (editingElement) {
      onUpdateElement(editingElement.id, { content: editValue });
    }
    setEditingElement(null);
  };

  return (
    <div className="bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-200 relative" style={{ width: data.size.width * scale, height: data.size.height * scale }}>
      <Stage
        width={data.size.width}
        height={data.size.height}
        scaleX={scale}
        scaleY={scale}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelect(null);
        }}
      >
        <Layer>
          {data.elements.map((el) => (
            <ElementRenderer
              key={el.id}
              el={el}
              isSelected={selectedId === el.id}
              onSelect={onSelect}
              onUpdate={onUpdateElement}
              onStartEdit={handleStartEdit}
              isEditing={editingElement?.id === el.id}
            />
          ))}
        </Layer>
      </Stage>

      {editingElement && (
        <textarea
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleFinishEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleFinishEdit();
            }
          }}
          style={{
            position: 'absolute',
            top: editingElement.position.y * scale,
            left: editingElement.position.x * scale,
            width: (editingElement.size?.width || 200) * scale,
            height: (editingElement.size?.height || 50) * scale,
            fontSize: (editingElement.style?.fontSize || 16) * scale,
            fontFamily: editingElement.style?.fontFamily || 'Inter',
            fontWeight: editingElement.style?.fontWeight || 'normal',
            fontStyle: editingElement.style?.fontStyle || 'normal',
            textAlign: (editingElement.style?.textAlign as any) || 'left',
            color: editingElement.style?.fill || '#000000',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            margin: 0,
            resize: 'none',
            overflow: 'hidden',
            lineHeight: 1,
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
};

export default CanvasRenderer;
