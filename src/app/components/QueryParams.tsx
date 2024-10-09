import  { useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface QueryParamsProps {
  onParamsChange: (params: QueryParamValues) => void;
}

interface QueryParamValues {
  id: string | null;
  fileHash: string | null;
  title: string | null;
  description: string | null;
}

export default function QueryParams({ onParamsChange }: QueryParamsProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    const fileHash = searchParams.get("fileHash");
    const title = searchParams.get("title");
    const description = searchParams.get("description");

    onParamsChange({ id, fileHash, title, description });
  }, [searchParams, onParamsChange]);

  return null;
}