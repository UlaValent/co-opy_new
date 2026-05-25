using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameApp.Integration.Migrations
{
    /// <inheritdoc />
    public partial class AddLobbyGameMode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Mode",
                table: "Lobbies",
                type: "TEXT",
                nullable: false,
                defaultValue: "{}");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mode",
                table: "Lobbies");
        }
    }
}