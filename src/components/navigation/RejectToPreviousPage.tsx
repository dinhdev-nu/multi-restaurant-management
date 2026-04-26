import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RejectToPreviousPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate("/", { replace: true });
    }, [navigate]);

    return null;
};

export default RejectToPreviousPage;
