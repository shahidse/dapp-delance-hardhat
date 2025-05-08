import React from "react";
import { formatEther } from "ethers";

interface Request {
  title: string;
  amount: bigint; // Assuming `amount` is returned as a BigInt
  locked: boolean;
}

interface ApproveRequestProps {
  requests: Request[];
  approveRequest: (index: number) => void;
  loading: boolean;
}

const ApproveRequest: React.FC<ApproveRequestProps> = ({
  requests,
  approveRequest,
  loading,
}) => {
  const pendingRequests = requests.filter((req) => req.locked);

  return (
    <div className="card shadow-sm p-4 mb-5">
      <h3 className="mb-4 text-primary">Approve Payment Requests</h3>
      {pendingRequests.length === 0 ? (
        <p className="text-muted">No pending payment requests to approve.</p>
      ) : (
        <ul className="list-group list-group-flush">
          {requests.map((req, index) =>
            req.locked ? (
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
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => approveRequest(index)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Approve"}
                </button>
              </li>
            ) : null
          )}
        </ul>
      )}
    </div>
  );
};

export default ApproveRequest;
