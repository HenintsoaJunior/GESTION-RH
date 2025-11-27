using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Models.dto.recruitment;

namespace MyApp.Api.Repositories.recruitment;

public interface IRequestListRepo
{
    // Task<List<RequestListDTO>> GetAllRequests([FromBody] FilterRequestListDTO dto);
}


public class RequestListRepo : IRequestListRepo
{
    private readonly AppDbContext _dbCtx;

    public RequestListRepo(AppDbContext ctx) {
        _dbCtx = ctx;
    }

    // public async Task<List<RequestListDTO>> GetAllRequests([FromBody] FilterRequestListDTO dto) {
    //     string postName = dto.Post != null ? dto.Post.ToLower() : string.Empty;

    //     var query = _dbCtx.RequestValidations
    //         .Include(r => r.Request).Include(r => r.Status)
    //     .AsQueryable();

    //     if(!string.IsNullOrEmpty(postName)) 
    //         query = query.Where(r => r.Request.Post.ToLower().Contains()) 
    // }
}
