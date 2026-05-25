
"use client";

import React from "react";


const CONTRIBUTORS = [
  { name: "Ali Khan" },
  { name: "Sara Ahmed" },
  { name: "Usman Tariq" },
  { name: "Fatima Noor" },
  { name: "Hamza Malik" },
];

function initials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("");
}
const ITEMS_PER_PAGE = 5;


export default function Contributor({ currentData }) {
if (!currentData || !Array.isArray(currentData)) {
    return <p style={{ color: "#666" }}>No contributor data available.</p>;
  }
  return (
   <div style={{ marginTop: "20px" }}>
      <h4>Active Contributors List</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {currentData.map((user) => (
          <li key={user.id} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <strong>{user.name}</strong> — <span style={{ color: "#666" }}>{user.email}</span>
          </li>
        ))}
      </ul>
      </div>
  );
}