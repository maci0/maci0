const std = @import("std");

pub fn add(a: i32, b: i32) i32 {
    return a + b;
}

pub fn main() !void {
    const sum = add(1, 2);
    try std.io.getStdOut().writer().print("{d}\n", .{sum});
}
