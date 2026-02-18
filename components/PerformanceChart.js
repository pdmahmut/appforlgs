import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const PerformanceChart = ({ data, config }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const ctx = chartRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => item.name),
        datasets: [
          {
            label: 'Toplam Net',
            data: data.map(item => item.totalNet),
            backgroundColor: data.map(item => item.color),
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 120,
          },
        },
      },
    });

    return () => {
      chart.destroy();
    };
  }, [data]);

  return (
    <div className="rounded-2xl p-6 shadow-lg" style={{ background: config.surface_color }}>
      <h2 className="text-lg font-bold" style={{ color: config.text_color }}>📊 Son Ortak Deneme Performansı</h2>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PerformanceChart;