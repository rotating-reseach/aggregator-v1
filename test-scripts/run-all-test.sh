if [ "$1" != "--skip-build" ]; then
  anchor build &&
    cp target/idl/aggregator_v1.json sdk/src/idl/ &&
    cp target/types/aggregator_v1.ts sdk/src/types/ 
fi

test_files=(
    aggregator/initialize-group.ts
    aggregator/initialize-map.ts
    drift/initialize-vault.ts
    user/initialize-user.ts
)

for test_file in ${test_files[@]}; do
  export ANCHOR_TEST_FILE=${test_file} && anchor test --skip-build || exit 1
done