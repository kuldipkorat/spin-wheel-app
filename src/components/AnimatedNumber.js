import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';

export default function AnimatedNumber({ value, style, duration = 1000 }) {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        let start = displayValue;
        const end = value;
        if (start === end) return;

        const range = end - start;
        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function (easeOutQuad)
            const t = progress;
            const ease = t * (2 - t);

            const current = Math.floor(start + range * ease);
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return <Text style={style}>{displayValue.toLocaleString()}</Text>;
}
