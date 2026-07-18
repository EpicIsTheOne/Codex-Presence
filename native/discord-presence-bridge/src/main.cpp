#include "json_protocol.hpp"
#include "presence_service.hpp"
#include <atomic>
#include <chrono>
#include <iostream>
#include <thread>
int main(){PresenceService service;std::atomic<bool> running{true};std::thread callbacks([&]{while(running){service.callbacks();std::this_thread::sleep_for(std::chrono::milliseconds(50));}});std::cout<<"{\"type\":\"status\",\"status\":\"connected\"}"<<std::endl;std::string line;while(std::getline(std::cin,line)){auto parsed=parse_command(line);if(!parsed.command){std::cout<<"{\"type\":\"error\",\"code\":\"INVALID_COMMAND\",\"message\":\""<<json_escape(parsed.error)<<"\"}"<<std::endl;continue;}auto& command=*parsed.command;if(command.type=="shutdown"){service.clear();std::cout<<"{\"type\":\"result\",\"command\":\"shutdown\",\"success\":true}"<<std::endl;break;}if(command.type=="clearPresence"){service.clear();std::cout<<"{\"type\":\"result\",\"command\":\"clearPresence\",\"success\":true}"<<std::endl;continue;}const bool ok=service.set(command);std::cout<<"{\"type\":\"result\",\"command\":\"setPresence\",\"success\":"<<(ok?"true":"false")<<"}"<<std::endl;}running=false;callbacks.join();return 0;}
