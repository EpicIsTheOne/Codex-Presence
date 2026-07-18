#pragma once
#include "json_protocol.hpp"
#include <memory>
namespace discordpp { class Client; }
class PresenceService { public: PresenceService();~PresenceService();bool set(const PresenceCommand& command);void clear();void callbacks();private:std::shared_ptr<discordpp::Client> client_;uint64_t application_id_=0;};
