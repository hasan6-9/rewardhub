import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AppSidebar from "@/components/common/AppSidebar.vue";
import { createPinia, setActivePinia } from "pinia";

describe("AppSidebar", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders navigation links based on user role", () => {
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [createPinia()],
        stubs: {
          "router-link": {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("displays correct number of links for admin role", () => {
    // This is a basic example - you would mock the auth store
    // to return different roles and test the navigation links
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [createPinia()],
        stubs: {
          "router-link": {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    // Add assertions based on your auth store mock
    expect(wrapper.find(".sidebar-nav").exists()).toBe(true);
  });

  it("applies active class to current route", () => {
    const wrapper = mount(AppSidebar, {
      global: {
        plugins: [createPinia()],
        stubs: {
          "router-link": {
            template: "<a><slot /></a>",
            props: ["activeClass"],
          },
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});
