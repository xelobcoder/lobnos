import { Backspace } from "@mui/icons-material";

export default function UpgradeToProfessional() {
        return (<section className="bg-warning p-5 justify-content-center d-flex">
                <div>
                        <h4>Kindly upgrade to professional version to have access
                        </h4>
                        <div className="d-flex justify-content-center">
                                <button onClick={(ev) => { window.history.back() }} className="btn btn-secondary "> <Backspace /> {" "}back</button>
                        </div>
                </div>
        </section>)
}