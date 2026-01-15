
import DocumentPageContent from "./DocumentPageContent"
import * as React from "react";

export default function DocumentPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams?: { party1_name?: string, party2_name?: string, readOnly?: string } }) {
  const { id } = React.use(params);
  const party1_name = searchParams?.party1_name || "";
  const party2_name = searchParams?.party2_name || "";
  const readOnly = searchParams?.readOnly === "1";
  return <DocumentPageContent id={id} party1_name={party1_name} party2_name={party2_name} readOnly={readOnly} />;
}
