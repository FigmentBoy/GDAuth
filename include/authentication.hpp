#pragma once

#include <Geode/Geode.hpp>
#include <Geode/utils/web.hpp>

using namespace geode::prelude;

#ifdef GEODE_IS_WINDOWS
    #ifdef AUTHENTICAITON_EXPORTING
        #define AUTHENTICATION_DLL __declspec(dllexport)
    #else
        #define AUTHENTICATION_DLL __declspec(dllimport)
    #endif
#else
    #define AUTHENTICATION_DLL __attribute__((visibility("default")))
#endif

namespace authentication {
    class AUTHENTICATION_DLL AuthenticationManager {
    private:
        std::string m_token = "-1";
        EventListener<web::WebTask> m_listener;

    public:
        static AuthenticationManager* get() {
            static AuthenticationManager* instance = new AuthenticationManager;
            return instance;
        }

        void getAuthenticationToken(std::function<void(std::string)> callback, std::function<void(std::string)> onFailure = [](std::string){});
    };
}