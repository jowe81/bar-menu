import React, { useEffect, useState } from "react";

function AnalogClock({ diameter }) {
    if (!diameter) {
        diameter = 500;
    }
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const radius = diameter / 2;
    const center = radius;
    const hour = time.getHours() % 12;
    const minute = time.getMinutes();
    const second = time.getSeconds();

    const hourAngle = (hour + minute / 60) * 30;
    const minuteAngle = (minute + second / 60) * 6;
    const secondAngle = second * 6;

    const clockColor = 'rgba(255, 255, 255, 0.1';
    const handsColorMS = 'rgba(255, 255, 255, .9)';
    const handStyle = function (length, width, color, angle) {
        // Make it go backwards.
        angle = 360 - angle;
        return {
            position: "absolute",
            width: `${width}px`,
            height: `${length}px`,
            backgroundColor: color,
            top: `${center - length}px`,
            left: `${center - width / 2}px`,
            transform: `rotate(${angle}deg)`,
            transformOrigin: "center bottom",
            borderRadius: "2px",
        }
    };

    return (
        <div
            style={{
                position: "relative",
                top: '100px',
                left: '-350px',
                width: `${diameter}px`,
                height: `${diameter}px`,
                borderRadius: "50%",
                border: "4px solid " + clockColor,
                backgroundColor: clockColor,
                margin: "0 auto",
            }}
        >
            {/* Hour Hand */}
            <div style={handStyle(radius * 0.5, 6, handsColorMS, hourAngle)} />
            {/* Minute Hand */}
            <div style={handStyle(radius * 0.7, 4, handsColorMS, minuteAngle)} />
            {/* Second Hand */}
            <div style={handStyle(radius * 0.9, 2, clockColor, secondAngle)} />

            {/* Center Dot */}
            <div
                style={{
                    position: "absolute",
                    width: "10px",
                    height: "10px",
                    backgroundColor: clockColor,
                    borderRadius: "50%",
                    top: `${center - 5}px`,
                    left: `${center - 5}px`,
                }}
            />
        </div>
    );
}

export default AnalogClock;
