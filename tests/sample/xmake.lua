add_rules("mode.debug", "mode.release")

add_requires("libpng", "libogg", "libplist", {system = false})

target("sample")
    set_kind("binary")
    add_files("src/*.cpp")
    add_packages("libpng", "libogg", "libplist")

