import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../components/Navbar";

describe("Navbar component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders default navigation items without admin", () => {
    render(
      <MemoryRouter>
        <Navbar searchText="" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Ví/i)).toBeInTheDocument();
    expect(screen.getByText(/Giao dịch/i)).toBeInTheDocument();
    expect(screen.queryByText(/Admin/i)).not.toBeInTheDocument();
  });

  it("renders admin item when role is ADMIN", () => {
    localStorage.setItem("role", "ADMIN");

    render(
      <MemoryRouter>
        <Navbar searchText="" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin/i)).toBeInTheDocument();
  });

  it("filters items case-insensitively", () => {
    render(
      <MemoryRouter>
        <Navbar searchText="giao" />
      </MemoryRouter>
    );

    expect(screen.getByText(/Giao dịch/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
  });

  it("trims whitespace when filtering searchText", () => {
    render(
      <MemoryRouter>
        <Navbar searchText="  mục tiêu  " />
      </MemoryRouter>
    );

    expect(screen.getByText(/Mục tiêu/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
  });

  it("shows no items when searchText does not match", () => {
    render(
      <MemoryRouter>
        <Navbar searchText="khong ton tai" />
      </MemoryRouter>
    );

    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});