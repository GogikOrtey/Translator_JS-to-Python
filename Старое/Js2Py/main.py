from Parser_JS import *

# l = Lexer("./code.txt")
#
# pars = l
# print(pars)
#
# t = pars.get_next_token()
# while t.name != Lexer.EOF:
#     print(t)
#     t = pars.get_next_token()
# print(t)

def main():
    l = Lexer("./code.txt")
    prs = Parser(l)
    prs = prs.parse()
    # print(prs)
    cg = CodeGenerator(prs)
    print(cg)


if __name__ == '__main__':
    main()
