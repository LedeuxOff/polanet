import { ComponentProps } from "react";
import { ListPagination } from "@/components/data-list";
import { PAGE_OPTIONS } from "../../hooks";

export const UsersPagination = (props: ComponentProps<typeof ListPagination>) => (
  <ListPagination pageOptions={PAGE_OPTIONS} {...props} />
);
