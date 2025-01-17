import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { DataRow } from "./Table";

type TableFooterProps = {
  columns: string[];
  data: DataRow[];
};

const TableFooter: React.FC<TableFooterProps> = ({
  columns,
  data,
}) => (
  <tfoot className="border-t bg-white w-full border-gray-100">
    <tr className="flex w-full px-4 py-8">
      <td
        colSpan={columns.length}
        className=" w-full"
        style={{ width: "calc(100%)", display: "flex" }}
      >
    
      </td>
    </tr>
  </tfoot>
);

export default TableFooter;
