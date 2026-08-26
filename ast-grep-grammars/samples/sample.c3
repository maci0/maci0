module test;
import std::io;

fn int add(int a, int b)
{
	return a + b;
}

fn void main()
{
	int x = add(1, 2);
	io::printn(x);
}
