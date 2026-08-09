using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportRouteCarrierInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CarrierName",
                table: "TransportRoutes",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VehicleModel",
                table: "TransportRoutes",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarrierName",
                table: "TransportRoutes");

            migrationBuilder.DropColumn(
                name: "VehicleModel",
                table: "TransportRoutes");
        }
    }
}
