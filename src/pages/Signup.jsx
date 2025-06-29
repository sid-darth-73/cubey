import { Button } from "../components/ui/Button";
import { Input } from "../components/Input";
import { useNavigate } from "react-router-dom";

export function Signup() {
    const navigate = useNavigate()

    function signin() {
        navigate("/dashboard")
    }
    return (
        <div>
            <div >
                <div>
                    <Input placeholder="enter creds"></Input>
                </div>
                <div>
                    <Button text="Click" variant="secondary" size="md" onClick={signin}></Button>
                </div>

            </div>
            
        </div>
    )
}