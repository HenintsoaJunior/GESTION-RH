namespace MyApp.Api.Models.dto.import
{
    public class ImportResult
    {
        public string FileName { get; set; } = string.Empty;
        public int TotalRows { get; set; }
        public List<EmployeeRow> Employees { get; set; } = new();
        public List<string> Headers { get; set; } = new();
    }

    public class EmployeeRow
    {
        public int RowNumber { get; set; }
        public Dictionary<string, string> Data { get; set; } = new();
    }
}