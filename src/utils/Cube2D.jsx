const COLOR_MAP = {
  W: 'white',
  Y: 'yellow',
  R: 'red',
  O: 'orange',
  B: 'blue',
  G: 'green',
};

function Face({ face, size }) {
  const N = face.length; 
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${N}, ${size}px)`,
        gap: '2px',
        padding: '2px',
      }}
    >
      {face.flat().map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: COLOR_MAP[color] || 'gray',
            border: '1px solid #000',
            borderRadius: '3px',
            boxShadow: 'inset 0 0 3px rgba(0,0,0,0.2)',
          }}
        />
      ))}
    </div>
  );
}

export function Cube2D({ cube, size = 30 }) {
  const N = cube.U.length; 
  const faceDimension = N * size + 2 * 2 + 2 * 1;
  const totalFaceWidth = faceDimension;
  const totalFaceHeight = faceDimension;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${totalFaceWidth}px)`,
        gridTemplateRows: `repeat(3, ${totalFaceHeight}px)`,
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}
    >
      {/* U face */}
      <div style={{ gridColumn: '2 / span 1', gridRow: '1 / span 1' }}>
        <Face face={cube.U} size={size} />
      </div>

      {/* L face */}
      <div style={{ gridColumn: '1 / span 1', gridRow: '2 / span 1' }}>
        <Face face={cube.L} size={size} />
      </div>

      {/* F face */}
      <div style={{ gridColumn: '2 / span 1', gridRow: '2 / span 1' }}>
        <Face face={cube.F} size={size} />
      </div>

      {/* R face */}
      <div style={{ gridColumn: '3 / span 1', gridRow: '2 / span 1' }}>
        <Face face={cube.R} size={size} />
      </div>

      {/* B face */}
      <div style={{ gridColumn: '4 / span 1', gridRow: '2 / span 1' }}>
        <Face face={cube.B} size={size} />
      </div>

      {/* D face */}
      <div style={{ gridColumn: '2 / span 1', gridRow: '3 / span 1' }}>
        <Face face={cube.D} size={size} />
      </div>
    </div>
  );
}
