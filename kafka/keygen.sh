openssl genrsa 4096 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -nocrypt
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
PUBK=`cat ./rsa_key.pub | grep -v KEY- | tr -d '\012'`
echo "ALTER USER RIDESHARE_INGEST SET RSA_PUBLIC_KEY='$PUBK';"

echo ""
PRVK=`cat ./rsa_key.p8 | grep -v KEY- | tr -d '\012'`
echo "PRIVATE_KEY=$PRVK"