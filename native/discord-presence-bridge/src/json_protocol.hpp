#pragma once
#include <cstdint>
#include <optional>
#include <string>
struct PresenceCommand { std::string type; std::string application_id; std::string name; std::string details; std::optional<std::string> state; std::optional<uint64_t> start_timestamp; std::optional<std::string> large_image; std::optional<std::string> large_text; std::optional<std::string> small_image; std::optional<std::string> small_text; };
struct ParseResult { std::optional<PresenceCommand> command; std::string error; };
ParseResult parse_command(const std::string& line);
std::string json_escape(const std::string& value);
