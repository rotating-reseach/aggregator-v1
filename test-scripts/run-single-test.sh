SKIP_BUILD=false
SKIP_LOCAL_VALIDATOR=false

for arg in "$@"; do
  if [ "$arg" == "--skip-build" ]; then
    SKIP_BUILD=true
  elif [ "$arg" == "--skip-local-validator" ]; then
    SKIP_LOCAL_VALIDATOR=true
  fi
done

if [ "$SKIP_BUILD" == false ]; then
  anchor build -p aggregator-v1 &&
  cp target/idl/aggregator_v1.json sdk/src/idl/ &&
  cp target/types/aggregator_v1.ts sdk/src/types/
fi

test_files=(
    # aggregator/initialize-group.ts
    # aggregator/initialize-map.ts
    # drift/initialize-vault.ts
    user/initialize-user.ts
)

for test_file in ${test_files[@]}; do
  if [ "$SKIP_LOCAL_VALIDATOR" == true ]; then
    ANCHOR_TEST_FILE=${test_file} anchor test --skip-build --skip-local-validator || exit 1;
  else 
    ANCHOR_TEST_FILE=${test_file} anchor test --skip-build || exit 1;
  fi
done