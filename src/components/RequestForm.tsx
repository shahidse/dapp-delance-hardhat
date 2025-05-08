import React, { useState } from "react";

interface RequestFormProps {
  createRequest: (title: string, amount: string) => void;
  loading: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({ createRequest, loading }) => {
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createRequest(title, amount);
  };

  return (
    <div className="card shadow-sm p-4">
      <h3 className="mb-4 text-primary">Create a Payment Request</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter request title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Amount (ETH)</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            placeholder="Enter amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-outline-primary w-100"
          disabled={loading}
        >
          {loading ? "Processing..." : "Create Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;
