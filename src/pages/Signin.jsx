import { Button } from "../components/ui/Button";
import { Input } from "../components/Input";
import { useNavigate } from "react-router-dom";

export function Signin() {
    const navigate = useNavigate()

    function signin() {
        navigate("/dashboard")
    }
    return (
        <div>
            <Input placeholder="enter creds"></Input>
            <Button variant="secondary" size="sm" onClick={signin}></Button>
        </div>
    )
}