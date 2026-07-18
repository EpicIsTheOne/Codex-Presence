#define DISCORDPP_IMPLEMENTATION
#include "discordpp.h"
#include "presence_service.hpp"
#include <cstdlib>
PresenceService::PresenceService():client_(std::make_shared<discordpp::Client>()){}
PresenceService::~PresenceService(){clear();}
bool PresenceService::set(const PresenceCommand& c){const auto id=std::strtoull(c.application_id.c_str(),nullptr,10);if(id==0)return false;if(id!=application_id_){client_->SetApplicationId(id);application_id_=id;}discordpp::Activity activity;activity.SetType(discordpp::ActivityTypes::Playing);activity.SetName("Codex");activity.SetDetails(c.details);activity.SetState(c.state);if(c.start_timestamp){discordpp::ActivityTimestamps timestamps;timestamps.SetStart(*c.start_timestamp);activity.SetTimestamps(timestamps);}if(c.large_image||c.large_text||c.small_image||c.small_text){discordpp::ActivityAssets assets;assets.SetLargeImage(c.large_image);assets.SetLargeText(c.large_text);assets.SetSmallImage(c.small_image);assets.SetSmallText(c.small_text);activity.SetAssets(assets);}client_->UpdateRichPresence(std::move(activity),[](const discordpp::ClientResult&){});return true;}
void PresenceService::clear(){if(client_)client_->ClearRichPresence();}
void PresenceService::callbacks(){discordpp::RunCallbacks();}
