import { Modal } from "react-bootstrap"

export default function ExpenseRejectionModal({ show, hide }) {
  return (
    <main>
      <Modal show={show}>
        <Modal.Header closeButton onHide={hide}>
          Please Provide Information for rejection
        </Modal.Header>
        <Modal.Body>
          <textarea className="form-control" rows={5} />
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary btn-sm">Reject Expense</button>
          <button type="button" onClick={(ev) =>  {hide()}} className="btn btn-danger btn-sm">
            close
          </button>
        </Modal.Footer>
      </Modal>
    </main>
  )
}
