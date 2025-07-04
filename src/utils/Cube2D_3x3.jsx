const COLOR_MAP = {
  W: 'white',
  Y: 'yellow',
  R: 'red',
  O: 'orange',
  B: 'blue',
  G: 'green',
};

function Face({ face, size }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, ${size}px)`,
        gap: '2px',
        //border: '1px solid #ccc',
        padding: '2px',
      }}
    >
      {face.flat().map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: COLOR_MAP[color],
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
  const FACE_DIMENSION = 3 * size + 2 * 2 + 2 * 1;
  const TOTAL_FACE_WIDTH = FACE_DIMENSION;
  const TOTAL_FACE_HEIGHT = FACE_DIMENSION;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${TOTAL_FACE_WIDTH}px)`,
        gridTemplateRows: `repeat(3, ${TOTAL_FACE_HEIGHT}px)`,
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
