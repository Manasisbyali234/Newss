import { useNavigate } from "react-router-dom";
import { popupType } from "../../../globals/constants";
import { publicUser } from "../../../globals/route-names";
import { useAuth } from "../../../contexts/AuthContext";
import { logout as authLogout } from "../../../utils/auth";

function YesNoPopup(props) {

    const navigate = useNavigate();
    const { logout } = useAuth();

    const yesHandler = () => {
        if(props.type === popupType.LOGOUT) {
            logout();
            authLogout();
            navigateToAfterLogin();
        }
    }

    const navigateToAfterLogin = () => {
        navigate(publicUser.INITIAL);
    }

    return (
        <>
            <div className="modal fade twm-model-popup" id={props.id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>

                        <div className="modal-body">
                            <h4 className="modal-title">{props.msg}</h4>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="site-button outline-primary" data-bs-dismiss="modal" onClick={yesHandler}>Yes</button>
                            <button type="button" className="site-button" data-bs-dismiss="modal">No</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default YesNoPopup;
