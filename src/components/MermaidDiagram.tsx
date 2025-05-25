// components/MermaidDiagram.tsx
import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface Props {
  chart: string;
  chartId: string;
  title?: string;
}

const MermaidDiagram: React.FC<Props> = ({ chart, chartId, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });

    const renderChart = async () => {
      if (containerRef.current) {
        try {
          const { svg } = await mermaid.render(chartId, chart);
          containerRef.current.innerHTML = svg;
        } catch (err) {
          console.error('Mermaid render error:', err);
        }
      }
    };

    renderChart();
  }, [chart, chartId]);

  return (
    <div className="my-8">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div ref={containerRef} />
    </div>
  );
};

export default MermaidDiagram;
