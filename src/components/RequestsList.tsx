import React from "react";
import { formatEther } from "ethers";

interface Request {
  title: string;
  amount: bigint;
  locked: boolean;
}

interface RequestsListProps {
  requests: Request[];
}

const RequestsList: React.FC<RequestsListProps> = ({ requests }) => {
  return (
    <div className="card shadow-sm p-4">
      <h3 className="mb-4 text-success">Freelancer Payment Requests</h3>
      {requests.length === 0 ? (
        <p className="text-muted">No requests found.</p>
      ) : (
        <ul className="list-group">
          {requests.map((req, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <h6 className="mb-1">{req.title}</h6>
                <small className="text-muted">
                  Amount: {formatEther(req.amount)} ETH
                </small>
              </div>
              <span
                className={`badge rounded-pill ${
                  req.locked ? "bg-warning text-dark" : "bg-success"
                }`}
              >
                {req.locked ? "Pending" : "Approved"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestsList;
