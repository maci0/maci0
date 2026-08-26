use fmt;

fn add(a: int, b: int) int = a + b;

export fn main() void = {
	const x = add(1, 2);
	fmt::println(x)!;
};
