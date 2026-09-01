# Environment

- OS: Windows 11 (10.0.26200)
- SDK: .NET SDK 9.0.300 / ASP.NET Core runtime 9.0.5
- PostgreSQL: 18.1 container
- Native driver: Npgsql 10.0.3
- Raw SQL Rules source commit: `2353a6637d1b696049324ece723c9011f621b7e7`
- Rules SHA-256: `A0E1F71BFBF4CE664F581757284A08B8C9EB6EB28AE9E953CC38965189AB7375`

.NET 10 was the current LTS at setup time, but its SDK was not installed; the example uses the available supported .NET 9 SDK and records this environment limitation.

The first `docker compose up` failed because default Docker address pools were exhausted. The compose file was amended to use the inspected unused `192.168.64.0/20` disposable subnet; PostgreSQL then started at `localhost:54329`.
