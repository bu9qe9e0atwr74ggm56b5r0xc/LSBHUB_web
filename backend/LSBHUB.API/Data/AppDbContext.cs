using Microsoft.EntityFrameworkCore;
using LSBHUB.API.Models.Entities;

namespace LSBHUB.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Operation> Operations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Users ──────────────────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Username).HasMaxLength(50).IsRequired();
            e.Property(u => u.Email).HasMaxLength(255).IsRequired();
            e.Property(u => u.PasswordHash).HasMaxLength(255).IsRequired();
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // ── Operations ─────────────────────────────────────────────────────
        modelBuilder.Entity<Operation>(e =>
        {
            e.ToTable("operations");
            e.HasKey(o => o.Id);
            e.Property(o => o.OperationType).HasMaxLength(10).IsRequired();
            e.Property(o => o.OriginalImagePath).HasMaxLength(500);
            e.Property(o => o.StegoImagePath).HasMaxLength(500);
            e.Property(o => o.EncryptionKey).HasMaxLength(255);
            e.Property(o => o.ChannelsUsed).HasMaxLength(10).IsRequired();
            e.Property(o => o.LsbMethod).HasMaxLength(20).IsRequired();
            e.Property(o => o.MseValue).HasPrecision(10, 4);
            e.Property(o => o.PsnrValue).HasPrecision(10, 4);

            e.HasOne(o => o.User)
             .WithMany(u => u.Operations)
             .HasForeignKey(o => o.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}