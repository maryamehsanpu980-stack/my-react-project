import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

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



export default function Contributor() {

    const searchParams = useSearchParams();
    const router = useRouter();
  
   
     // Current Page
    const currentPage =
      Number(searchParams.get("page")) || 1;
  
    // Items per page
    const itemsPerPage = 4;
  
    // Total pages
    const totalPages = Math.ceil(
      CONTRIBUTORS.length / itemsPerPage
    );
  
    // Start index
    const startIndex =
      (currentPage - 1) * itemsPerPage;
  
    // Current page data
    const currentContributors =
      CONTRIBUTORS.slice(
        startIndex,
        startIndex + itemsPerPage
      );
  
    // Change page function
    const changePage = (page) => {
      router.push(`/contributor?page=${page}`);
    };

  return (
    <div className="contributors-container">
      <h2>Contributors</h2>

      <ul className="contributor-list">
        {CONTRIBUTORS.map((c) => (
          <li key={c.name} className="contrib-row">
            <div className="contrib-avatar">
              {initials(c.name)}
            </div>

            <span>{c.name}</span>
          </li>
        ))}
      </ul>
     {/* Pagination Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {/* Previous */}
        <button
          disabled={currentPage === 1}
          onClick={() =>
            changePage(currentPage - 1)
          }
        >
          Previous
        </button>

        {/* Page Numbers */}
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() =>
              changePage(index + 1)
            }
            style={{
              background:
                currentPage === index + 1
                  ? "blue"
                  : "white",
              color:
                currentPage === index + 1
                  ? "white"
                  : "black",
              padding: "8px 12px",
              border: "1px solid gray",
            }}
          >
            {index + 1}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={
            currentPage === totalPages
          }
          onClick={() =>
            changePage(currentPage + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}