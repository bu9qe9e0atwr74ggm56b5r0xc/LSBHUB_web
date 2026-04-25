using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LSBHUB.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "operations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OperationType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    OriginalImagePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StegoImagePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    MessageText = table.Column<string>(type: "text", nullable: true),
                    EncryptionKey = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    BitsCount = table.Column<short>(type: "smallint", nullable: false),
                    ChannelsUsed = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    LsbMethod = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ChannelOrderRandom = table.Column<bool>(type: "boolean", nullable: false),
                    MseValue = table.Column<decimal>(type: "numeric(10,4)", precision: 10, scale: 4, nullable: true),
                    PsnrValue = table.Column<decimal>(type: "numeric(10,4)", precision: 10, scale: 4, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_operations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_operations_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_operations_UserId",
                table: "operations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Username",
                table: "users",
                column: "Username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "operations");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
