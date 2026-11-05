import { useState, useEffect, useRef } from 'react';

export default function StatsCounter({ stats }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <div ref={containerRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 py-10">
      {stats.map((stat, idx) => (
        <StatItem key={idx} stat={stat} trigger={hasAnimated} />
      ))}
    </div>
  );
}

function StatItem({ stat, trigger }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let start = 0;
    const end = stat.value;
    const duration = 1600; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(stat.isDecimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [trigger, stat.value, stat.isDecimal]);

  const formattedValue = () => {
    if (!trigger) return '0';
    if (stat.isDecimal) {
      return `${stat.prefix || ''}${count.toFixed(1)}${stat.suffix || ''}`;
    }
    if (stat.value >= 1000) {
      const kVal = (count / 1000).toFixed(count >= 10000 ? 0 : 1);
      return `${stat.prefix || ''}${kVal}${stat.suffix || ''}`;
    }
    return `${stat.prefix || ''}${count}${stat.suffix || ''}`;
  };

  return (
    <div className="text-center space-y-2">
      <div className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-[#1C1710] tracking-tight">
        {trigger ? formattedValue() : stat.display}
      </div>
      <div className="text-xs sm:text-sm text-[#1C1710]/70 font-medium tracking-wide">
        {stat.label}
      </div>
    </div>
  );
}

