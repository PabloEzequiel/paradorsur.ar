# www.paradorsur.com.ar



# GH Pages

git subtree push --prefix paradorsur  origin gh-pages

# Validate 

cd /d/sw/BIND9

./dig       paradorsur.com.ar   +noall +answer -t A
./dig   www.paradorsur.com.ar   +noall +answer -t A



# Web Site

    https://pabloezequiel.github.io/www.paradorsur.com.ar/


# SSH Config purebas

.git/config

url = git@github-PabloEzequiel:PabloEzequiel/www.paradorsur.com.ar.git
