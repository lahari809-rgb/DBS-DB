import React, { useRef, useEffect } from 'react';

export default function AudioWaveform({ isSpeaking }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isSpeaking ? '#16A34A' : '#D1DDD4';
      ctx.beginPath();

      const slices = 25;
      const sliceWidth = canvas.width / slices;
      let x = 0;

      for (let i = 0; i < slices; i++) {
        let v = 0.5;
        if (isSpeaking) {
          v += Math.sin(Date.now() * 0.02 + i * 0.6) * 0.38 * Math.random();
        }
        const y = v * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '120px',
        height: '28px',
        borderRadius: '6px',
        background: 'rgba(232, 239, 234, 0.6)'
      }}
    />
  );
}
