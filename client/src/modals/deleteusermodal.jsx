import React, { useState, useEffect } from "react";

function DeleteUserModal({ setShowModal, handleDelete }) {

    return (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} onClick={() => setShowModal(false)}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content rounded-3 shadow-lg border-0">
                    <div className="modal-header bg-danger text-white border-0 d-flex col justify-content-between">
                        <h5 className="modal-title">EMİN MİSİNİZ?</h5>
                        <div className="text-white" onClick={() => setShowModal(false)}>
                            <span>X</span>
                        </div>
                    </div>
                    <div className="modal-body">
                        <p className="fs-5">Oyuncuyu silmek istediğinizden emin misiniz?</p>
                    </div>
                    <div className="modal-footer d-flex col justify-content-between">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                            Hayır
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleDelete}>
                            Evet, Sil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteUserModal;
