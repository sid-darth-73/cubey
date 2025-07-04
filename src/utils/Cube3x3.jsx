import { DisplayCube, generateScramble, applyScramble } from 'react-rubiks-cube-utils';
import { Cube2D } from './Cube2D';

export function Cube() {
    const myScramble = generateScramble({ type: '3x3' });
    const myCube = applyScramble({ type: '3x3', scramble: myScramble });
    const str = JSON.stringify(myCube)
    return (
        <div>
            <p>Cube should render below:</p>
            {myScramble}
            {str}
            <br />
            <Cube2D cube={myCube} />
        </div>
    );
}
